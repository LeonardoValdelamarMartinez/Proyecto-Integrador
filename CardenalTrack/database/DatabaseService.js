// database/DatabaseService.js
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

class DatabaseService {
  constructor() {
    this.db = null;
    this.currentUserId = null;

    // Para Web
    this.storageKeyUsers = "usuarios";
  }

  // =========================
  // FECHA FORMATO MÉXICO
  // =========================
  getNowMexicoDateTime() {
    try {
      const formatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const parts = formatter.formatToParts(new Date());
      const map = {};
      parts.forEach((p) => (map[p.type] = p.value));

      return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
    } catch (e) {
      return new Date().toISOString();
    }
  }

  setCurrentUser(user) {
    this.currentUserId = user ? user.id : null;
  }

  getCurrentUserId() {
    return this.currentUserId;
  }

  // =========================
  // INICIALIZACIÓN SOLO TABLA USUARIOS
  // =========================
  async initialize() {
    if (Platform.OS === "web") return;
    if (this.db) return;

    this.db = await SQLite.openDatabaseAsync("miapp.db");

    await this.db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fecha_creacion TEXT
      );
    `);
  }

  // =========================
  // USUARIOS
  // =========================

  async getAll() {
    if (Platform.OS === "web") {
      const data = localStorage.getItem(this.storageKeyUsers);
      return data ? JSON.parse(data) : [];
    }

    await this.initialize();
    return await this.db.getAllAsync("SELECT * FROM usuarios ORDER BY id DESC;");
  }

  async registerUser(nombre, email, username, password) {
    await this.initialize();
    const fechaMX = this.getNowMexicoDateTime();

    // -------------------------
    // MODO WEB
    // -------------------------
    if (Platform.OS === "web") {
      const lista = await this.getAll();

      // Validar duplicados
      const existe = lista.find(
        (u) => u.email === email.trim() || u.username === username.trim()
      );
      if (existe) throw new Error("Datos duplicados");

      const nuevo = {
        id: Date.now(),
        nombre,
        email,
        username,
        password,
        fecha_creacion: fechaMX,
      };

      lista.unshift(nuevo);
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(lista));

      return nuevo;
    }

    // -------------------------
    // MODO APP / SQLITE
    // -------------------------
    try {
      const result = await this.db.runAsync(
        "INSERT INTO usuarios(nombre, email, username, password, fecha_creacion) VALUES (?, ?, ?, ?, ?);",
        [nombre, email, username, password, fechaMX]
      );

      return {
        id: result.lastInsertRowId,
        nombre,
        email,
        username,
        password,
        fecha_creacion: fechaMX,
      };
    } catch (e) {
      throw new Error("Datos duplicados");
    }
  }

  // LOGIN
  async getUserEmailPassword(email, password) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAll();
      return (
        lista.find(
          (u) =>
            u.email === email.trim().toLowerCase() &&
            u.password === password.trim()
        ) || null
      );
    }

    const rows = await this.db.getAllAsync(
      "SELECT * FROM usuarios WHERE email = ? AND password = ? LIMIT 1;",
      [email.trim().toLowerCase(), password.trim()]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // RECUPERAR POR EMAIL
  async getUserByEmail(email) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAll();
      return lista.find((u) => u.email === email.trim().toLowerCase()) || null;
    }

    const rows = await this.db.getAllAsync(
      "SELECT * FROM usuarios WHERE email = ? LIMIT 1;",
      [email.trim().toLowerCase()]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // CAMBIO DE CONTRASEÑA
  async updateUserPasswordByEmail(email, newPass) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAll();
      const idx = lista.findIndex(
        (u) => u.email === email.trim().toLowerCase()
      );
      if (idx === -1) return null;

      lista[idx].password = newPass;
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(lista));

      return true;
    }

    return await this.db.runAsync(
      "UPDATE usuarios SET password = ? WHERE email = ?;",
      [newPass, email.trim().toLowerCase()]
    );
  }
}

export default new DatabaseService();

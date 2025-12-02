// database/DatabaseService.js
import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

class DatabaseService {
  constructor() {
    this.db = null;
    this.currentUserId = null;

    // Claves para almacenamiento en Web
    this.storageKeyUsers = "usuarios";
    this.storageKeyReportes = "reportes_incidencias";
  }

  // =============================
  // UTILIDADES GENERALES
  // =============================

  // Fecha y hora en zona horaria de México
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

  // ID legible para usar como folio (usado en PantallaConfirmación como respaldo)
  generateReportId() {
    const now = this.getNowMexicoDateTime().replace(/[-:T]/g, "");
    return `INC-${now}`;
  }

  setCurrentUser(user) {
    this.currentUserId = user ? user.id : null;
  }

  getCurrentUserId() {
    return this.currentUserId;
  }

  async logout() {
    // Por ahora sólo limpiamos el usuario actual
    this.currentUserId = null;
    return true;
  }

  // =============================
  // INICIALIZAR BD (SQLite)
  // =============================
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

      CREATE TABLE IF NOT EXISTS reportes_incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        categoria TEXT,
        descripcion TEXT,
        ubicacion TEXT,
        sector TEXT,
        fecha TEXT,
        estado TEXT,
        prioridad TEXT,
        fecha_completa TEXT,
        user_id INTEGER
      );
    `);

    console.log("BD inicializada (usuarios + reportes_incidencias)");
  }

  // =============================
  // USUARIOS
  // =============================

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

    if (Platform.OS === "web") {
      const lista = await this.getAll();

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
      console.log("Error al registrar usuario:", e);
      throw new Error("Datos duplicados");
    }
  }

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

  // =============================
  // REPORTES DE INCIDENCIAS
  // =============================

  /**
   * Recibe un objeto reporte.
   * Puede ser sencillo:
   *   { categoria, descripcion, ubicacion, fecha?, estado? }
   * o el formato completo:
   *   { titulo, categoria, descripcion, ubicacion, sector, fecha,
   *     estado, prioridad }
   */
  async addReporteIncidencia(reporte) {
    await this.initialize();

    const userId = this.getCurrentUserId() || null;
    const fechaCompleta = this.getNowMexicoDateTime();

    const data = {
      titulo: reporte.titulo || reporte.categoria || "Incidencia",
      categoria: reporte.categoria || "",
      descripcion: reporte.descripcion || "",
      ubicacion: reporte.ubicacion || "",
      sector: reporte.sector || reporte.ubicacion || "",
      fecha: reporte.fecha || fechaCompleta,
      estado: reporte.estado || "pendiente",
      prioridad: reporte.prioridad || "Media",
      fecha_completa: fechaCompleta,
      user_id: userId,
    };

    // --- MODO WEB (localStorage) ---
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(this.storageKeyReportes);
      const lista = raw ? JSON.parse(raw) : [];

      const nuevo = {
        id: Date.now(),
        ...data,
      };

      lista.unshift(nuevo);
      localStorage.setItem(this.storageKeyReportes, JSON.stringify(lista));
      return nuevo;
    }

    // --- MODO NATIVO (SQLite) ---
    try {
      // aseguramos tabla
      await this.db.runAsync(`
        CREATE TABLE IF NOT EXISTS reportes_incidencias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT,
          categoria TEXT,
          descripcion TEXT,
          ubicacion TEXT,
          sector TEXT,
          fecha TEXT,
          estado TEXT,
          prioridad TEXT,
          fecha_completa TEXT,
          user_id INTEGER
        );
      `);

      const insertResult = await this.db.runAsync(
        `INSERT INTO reportes_incidencias 
          (titulo, categoria, descripcion, ubicacion, sector, fecha, estado, prioridad, fecha_completa, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          data.titulo,
          data.categoria,
          data.descripcion,
          data.ubicacion,
          data.sector,
          data.fecha,
          data.estado,
          data.prioridad,
          data.fecha_completa,
          data.user_id,
        ]
      );

      return {
        id: insertResult.lastInsertRowId,
        ...data,
      };
    } catch (error) {
      console.log("Error en INSERT reporte:", error);
      throw error;
    }
  }

  // Todos los reportes (para ListaIncidencias, Estadísticas, Seguimiento)
  async getAllReportes() {
    await this.initialize();

    // Web
    if (Platform.OS === "web") {
      const raw = localStorage.getItem(this.storageKeyReportes);
      const lista = raw ? JSON.parse(raw) : [];

      return lista.map((r) => ({
        id: r.id,
        titulo: r.titulo || r.categoria || "Incidencia",
        sector: r.sector || r.ubicacion || "N/A",
        fecha: r.fecha || r.fecha_completa || "",
        estado: r.estado || "pendiente",
        categoria: r.categoria || "",
        prioridad: r.prioridad || "Media",
        fecha_completa: r.fecha_completa || r.fecha || "",
        user_id: r.user_id || null,
      }));
    }

    // SQLite
    try {
      await this.db.runAsync(`
        CREATE TABLE IF NOT EXISTS reportes_incidencias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT,
          categoria TEXT,
          descripcion TEXT,
          ubicacion TEXT,
          sector TEXT,
          fecha TEXT,
          estado TEXT,
          prioridad TEXT,
          fecha_completa TEXT,
          user_id INTEGER
        );
      `);

      const rows = await this.db.getAllAsync(
        "SELECT * FROM reportes_incidencias ORDER BY fecha_completa DESC;"
      );

      return rows.map((r) => ({
        id: r.id,
        titulo: r.titulo || r.categoria || "Incidencia",
        sector: r.sector || r.ubicacion || "N/A",
        fecha: r.fecha || r.fecha_completa || "",
        estado: r.estado || "pendiente",
        categoria: r.categoria || "",
        prioridad: r.prioridad || "Media",
        fecha_completa: r.fecha_completa,
        user_id: r.user_id || null,
      }));
    } catch (e) {
      console.log("Error en getAllReportes:", e);
      return [];
    }
  }

  // Un reporte por ID (usado en PantallaConfirmación)
  async getReportById(id) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAllReportes();
      return lista.find((r) => r.id === id) || null;
    }

    try {
      const rows = await this.db.getAllAsync(
        "SELECT * FROM reportes_incidencias WHERE id = ? LIMIT 1;",
        [id]
      );
      if (rows.length === 0) return null;

      const r = rows[0];
      return {
        id: r.id,
        titulo: r.titulo || r.categoria || "Incidencia",
        sector: r.sector || r.ubicacion || "N/A",
        fecha: r.fecha || r.fecha_completa || "",
        estado: r.estado || "pendiente",
        categoria: r.categoria || "",
        prioridad: r.prioridad || "Media",
        fecha_completa: r.fecha_completa,
        user_id: r.user_id || null,
        descripcion: r.descripcion || "",
        ubicacion: r.ubicacion || "",
      };
    } catch (e) {
      console.log("Error en getReportById:", e);
      return null;
    }
  }

  // Reportes sólo del usuario logueado
  async getReportesUsuarioActual() {
    await this.initialize();
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    if (Platform.OS === "web") {
      const lista = await this.getAllReportes();
      return lista.filter((r) => r.user_id === userId);
    }

    try {
      const rows = await this.db.getAllAsync(
        "SELECT * FROM reportes_incidencias WHERE user_id = ? ORDER BY fecha_completa DESC;",
        [userId]
      );

      return rows.map((r) => ({
        id: r.id,
        titulo: r.titulo || r.categoria || "Incidencia",
        sector: r.sector || r.ubicacion || "N/A",
        fecha: r.fecha || r.fecha_completa || "",
        estado: r.estado || "pendiente",
        categoria: r.categoria || "",
        prioridad: r.prioridad || "Media",
        fecha_completa: r.fecha_completa,
        user_id: r.user_id || null,
      }));
    } catch (e) {
      console.log("Error en getReportesUsuarioActual:", e);
      return [];
    }
  }

  // Cambiar estado de un reporte (para seguimiento / administración)
  async updateReporteEstado(id, nuevoEstado) {
    await this.initialize();

    if (Platform.OS === "web") {
      const raw = localStorage.getItem(this.storageKeyReportes);
      const lista = raw ? JSON.parse(raw) : [];
      const idx = lista.findIndex((r) => r.id === id);
      if (idx === -1) return null;

      lista[idx].estado = nuevoEstado;
      localStorage.setItem(this.storageKeyReportes, JSON.stringify(lista));
      return true;
    }

    try {
      await this.db.runAsync(
        "UPDATE reportes_incidencias SET estado = ? WHERE id = ?;",
        [nuevoEstado, id]
      );
      return true;
    } catch (e) {
      console.log("Error en updateReporteEstado:", e);
      return false;
    }
  }
}

export default new DatabaseService();

import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

class DatabaseService {
  constructor() {
    this.db = null;
    this.currentUserId = null;

    // Para Web
    this.storageKeyUsers = "usuarios";
    this.storageKeyCurrentUser = "currentUser";
  }

  // FECHA FORMATO MÉXICO
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
    if (Platform.OS === "web" && user) {
      localStorage.setItem(this.storageKeyCurrentUser, JSON.stringify(user));
    }
  }

  getCurrentUserId() {
    if (Platform.OS === "web" && !this.currentUserId) {
      try {
        const stored = localStorage.getItem(this.storageKeyCurrentUser);
        if (stored) {
          const user = JSON.parse(stored);
          this.currentUserId = user.id;
        }
      } catch (e) {
        console.error("Error al recuperar usuario de localStorage:", e);
      }
    }
    return this.currentUserId;
  }

  // INICIALIZACIÓN
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
        fecha_creacion TEXT,
        facultad TEXT,
        matricula TEXT,
        semestre TEXT
      );

      CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        sector TEXT, 
        estado TEXT NOT NULL DEFAULT 'Pendientes',
        fecha TEXT,
        FOREIGN KEY (user_id) REFERENCES usuarios(id)
      );
    `);
  }

  // USUARIOS
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

  // Obtener usuario por ID
  async getUserById(userId) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAll();
      return lista.find((u) => u.id === userId) || null;
    }

    const rows = await this.db.getAllAsync(
      "SELECT * FROM usuarios WHERE id = ? LIMIT 1;",
      [userId]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  // Obtener estadísticas de reportes
  async getDetailedReportStats(userId) {
    await this.initialize();

    if (Platform.OS === "web") {
      return {
        total: 0,
        pendientes: 0,
        enProceso: 0,
        resueltos: 0
      };
    }

    const stats = await this.db.getAllAsync(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM incidencias 
      WHERE user_id = ?
      GROUP BY estado;
    `, [userId]);

    const result = {
      total: 0,
      pendientes: 0,
      enProceso: 0,
      resueltos: 0
    };

    stats.forEach(stat => {
      result.total += stat.cantidad;
      if (stat.estado === 'Pendientes') result.pendientes = stat.cantidad;
      if (stat.estado === 'En Proceso') result.enProceso = stat.cantidad;
      if (stat.estado === 'Resueltos') result.resueltos = stat.cantidad;
    });

    return result;
  }

  // Actualizar perfil de usuario
  async updateUserProfile(userId, profileData) {
    await this.initialize();

    if (Platform.OS === "web") {
      const lista = await this.getAll();
      const idx = lista.findIndex((u) => u.id === userId);
      if (idx === -1) return null;

      lista[idx] = { ...lista[idx], ...profileData };
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(lista));
      return lista[idx];
    }

    try {
      await this.db.runAsync(
        `UPDATE usuarios SET 
          nombre = ?,
          facultad = ?,
          matricula = ?,
          semestre = ?
        WHERE id = ?;`,
        [
          profileData.nombre,
          profileData.facultad,
          profileData.matricula,
          profileData.semestre,
          userId
        ]
      );

      return await this.getUserById(userId);
    } catch (e) {
      console.error("Error al actualizar perfil:", e);
      throw new Error("No se pudo actualizar el perfil");
    }
  }

  // INCIDENCIAS
  async crearIncidencia(userId, titulo, descripcion) {
    await this.initialize();
    const fechaMX = this.getNowMexicoDateTime();
    const sector = 'General';
    const estado = 'Pendientes';

    if (Platform.OS === "web") {
      console.log('Crear Incidencia (Web mode)');
      return null;
    }

    try {
      const result = await this.db.runAsync(
        "INSERT INTO incidencias(user_id, titulo, descripcion, sector, estado, fecha) VALUES (?, ?, ?, ?, ?, ?);",
        [userId, titulo, descripcion, sector, estado, fechaMX]
      );
      return result.lastInsertRowId;
    } catch (e) {
      console.error("Error al crear incidencia:", e);
      throw new Error("No se pudo crear la incidencia");
    }
  }
  
  async getIncidenciasByUser(userId) {
    await this.initialize();

    if (Platform.OS === "web") {
      return [];
    }
    
    return await this.db.getAllAsync(
      "SELECT * FROM incidencias WHERE user_id = ? ORDER BY id DESC;",
      [userId]
    );
  }

  async getAllReportes() {
    await this.initialize();

    if (Platform.OS === "web") {
      return [];
    }
    
    return await this.db.getAllAsync("SELECT * FROM incidencias ORDER BY id DESC;");
  }

  // GENERAR ID DE REPORTE
  generateReportId() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#INC-${year}${month}${day}-${random}`;
  }

  // LOGOUT
  logout() {
    console.log('Ejecutando logout...');
    this.currentUserId = null;
    
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(this.storageKeyCurrentUser);
        console.log('Usuario removido de localStorage');
      } catch (error) {
        console.error('Error al limpiar localStorage:', error);
      }
    }
    
    console.log('Logout completado');
    return Promise.resolve();
  }
}

export default new DatabaseService();
import { Usuario } from '../Models/Usuario';     
import DatabaseService from '../database/DatabaseService'; 

// Controlador que gestiona las operaciones relacionadas con usuarios
export class UsuarioController {

    constructor() {
        this.listeners = [];                       // Inicializa la lista de observadores que serán notificados ante cambios
    }

    // Inicializa la base de datos antes de usarla
    async initialize() {
        await DatabaseService.initialize();        // Llama al método que prepara las tablas/BD
    }

    // Obtiene todos los usuarios registrados
    async obtenerUsuarios() {
        try {
            const data = await DatabaseService.getAll(); // Consulta todos los registros desde la BD
            return data.map(u => new Usuario(            // Convierte cada registro a una instancia de Usuario
                u.id, 
                u.nombre, 
                u.fecha_creacion
            ));
        } catch (error) {
            console.log('Error al obtener usuarios: ', error); // Muestra el error en consola para depuración
            throw new Error('No se pudieron cargar los usuarios'); // Lanza un error más entendible
        }
    }

    // Crea un nuevo usuario
    async crearUsuario(nombre) {
        try {
            // Valida que el nombre no esté vacío o incorrecto
            Usuario.validar(nombre);                 

            const nuevoUsuario = await DatabaseService.add(nombre.trim());  
            // Inserta el usuario en la BD y recibe el registro creado
            // Notifica a las vistas que hubo un cambio
            this.notifyListeners();                  
            // Retorna una instancia del usuario recién creado
            return new Usuario(                      
                nuevoUsuario.id,
                nuevoUsuario.nombre,
                nuevoUsuario.fecha_creacion
            );

        } catch (error) {
            // Muestra el error en consola
            console.log('Error al crear usuario:', error); 
            throw error;                                   // Lanza el error para manejarlo en la vista
        }
    }

    // Agrega una función que será llamada cuando haya cambios
    addListener(callback) {
        this.listeners.push(callback);             
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback); 
        // Elimina un listener específico de la lista
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback()); 
        // Ejecuta todos los listeners registrados
    }
}

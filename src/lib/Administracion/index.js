const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');
const UsuarioRepositorySequelize = require('./infrastructure/AdministracionRepositorySequelize');

// Casos de uso de Administración
const CrearUsuario = require('./application/users/use-cases/CrearUsuario');
const ListarUsuarios = require('./application/users/use-cases/ListarUsuarios');
const ObtenerUsuario = require('./application/users/use-cases/ObtenerUsuario');
const ObtenerUsuarioPersona = require('./application/users/use-cases/ObtenerUsuarioPersona');
const ActualizarUsuario = require('./application/users/use-cases/ActualizarUsuario');
const EliminarUsuario = require('./application/users/use-cases/EliminarUsuario');

// Casos de uso de Autenticación
const Login = require('./application/auth/use-cases/Login');
const VerificarToken = require('./application/auth/use-cases/VerificarToken');
const ObtenerPerfil = require('./application/auth/use-cases/ObtenerPerfil');
const ActualizarPerfil = require('./application/auth/use-cases/ActualizarPerfil');

// Controllers
const UsuarioController = require('./infrastructure/http/controller/AdministracionController');
const AuthController = require('./infrastructure/http/controller/AuthController');

// Routes
const UsuarioRoutes = require("./infrastructure/http/routes/administracion.routes");
const AuthRoutes = require("./infrastructure/http/routes/auth.routes");

module.exports = function registerAdministracionModule(app) {
    // Infraestructura
    const personaRepository = new PersonaRepositorySequelize();
    const usuarioRepository = new UsuarioRepositorySequelize();

    // Casos de uso de Administración
    const crearUsuario = new CrearUsuario(usuarioRepository, personaRepository);
    const listarUsuarios = new ListarUsuarios(usuarioRepository);
    const obtenerUsuario = new ObtenerUsuario(usuarioRepository);
    const obtenerUsuarioPorPersona = new ObtenerUsuarioPersona(usuarioRepository);
    const actualizarUsuario = new ActualizarUsuario(usuarioRepository, personaRepository);
    const eliminarUsuario = new EliminarUsuario(usuarioRepository);

    // Casos de uso de Autenticación
    const login = new Login(usuarioRepository);
    const verificarToken = new VerificarToken(usuarioRepository);
    const obtenerPerfil = new ObtenerPerfil(usuarioRepository);
    const actualizarPerfil = new ActualizarPerfil(usuarioRepository);

    // Controller de Administración
    const usuarioController = new UsuarioController({
        crearUsuario,
        listarUsuarios,
        obtenerUsuario,
        obtenerUsuarioPorPersona,
        actualizarUsuario,
        eliminarUsuario,
    });

    // Controller de Autenticación
    const authController = new AuthController({
        login,
        verificarToken,
        obtenerPerfil,
        actualizarPerfil
    });

    // Registrar rutas
    app.use("/api/auth", AuthRoutes(authController));
    app.use("/api/admin", UsuarioRoutes(usuarioController));
};
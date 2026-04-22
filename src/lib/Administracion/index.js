const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');
const UsuarioRepositorySequelize = require('./infrastructure/AdministracionRepositorySequelize');

// Casos de uso de Administración
const CrearUsuario = require('./application/use-cases/users/CrearUsuario');
const ListarUsuarios = require('./application/use-cases/users/ListarUsuarios');
const ObtenerUsuario = require('./application/use-cases/users/ObtenerUsuario');
const ObtenerUsuarioPersona = require('./application/use-cases/users/ObtenerUsuarioPersona');
const ObtenerPersonaPorUsuario = require('./application/use-cases/users/ObtenerPersonaPorUsuario');
const ActualizarUsuario = require('./application/use-cases/users/ActualizarUsuario');
const EliminarUsuario = require('./application/use-cases/users/EliminarUsuario');

// Casos de uso de Autenticación
const Login = require('./application/use-cases/auth/Login');
const LoginGoogle = require('./application/use-cases/auth/LoginGoogle');
const VerificarToken = require('./application/use-cases/auth/VerificarToken');
const ObtenerPerfil = require('./application/use-cases/auth/ObtenerPerfil');
const ActualizarPerfil = require('./application/use-cases/auth/ActualizarPerfil');
const SolicitarRecuperacionPassword = require('./application/use-cases/auth/SolicitarRecuperacionPassword');
const RestablecerPassword = require('./application/use-cases/auth/RestablecerPassword');

// Controllers
const UsuarioController = require('./infrastructure/http/controller/AdministracionController');
const AuthController = require('./infrastructure/http/controller/AuthController');

// Routes
const UsuarioRoutes = require('./infrastructure/http/routes/administracion.routes');
const AuthRoutes = require('./infrastructure/http/routes/auth.routes');

module.exports = function registerAdministracionModule(app) {
    // Infraestructura
    const personaRepository = new PersonaRepositorySequelize();
    const usuarioRepository = new UsuarioRepositorySequelize();

    // Casos de uso de Administración
    const crearUsuario = new CrearUsuario(usuarioRepository, personaRepository);
    const listarUsuarios = new ListarUsuarios(usuarioRepository);
    const obtenerUsuario = new ObtenerUsuario(usuarioRepository);
    const obtenerUsuarioPorPersona = new ObtenerUsuarioPersona(usuarioRepository);
    const obtenerPersonaPorUsuario = new ObtenerPersonaPorUsuario(usuarioRepository);
    const actualizarUsuario = new ActualizarUsuario(usuarioRepository, personaRepository);
    const eliminarUsuario = new EliminarUsuario(usuarioRepository);

    // Casos de uso de Autenticación
    const login = new Login(usuarioRepository);
    const loginGoogle = new LoginGoogle(usuarioRepository);
    const verificarToken = new VerificarToken(usuarioRepository);
    const obtenerPerfil = new ObtenerPerfil(usuarioRepository);
    const actualizarPerfil = new ActualizarPerfil(usuarioRepository);
    const solicitarRecuperacion = new SolicitarRecuperacionPassword(usuarioRepository);
    const restablecerPassword = new RestablecerPassword(usuarioRepository);

    // Controller de Administración
    const usuarioController = new UsuarioController({
        crearUsuario,
        listarUsuarios,
        obtenerUsuario,
        obtenerUsuarioPorPersona,
        obtenerPersonaPorUsuario,
        actualizarUsuario,
        eliminarUsuario,
    });

    // Controller de Autenticación
    const authController = new AuthController({
        login,
        loginGoogle,
        verificarToken,
        obtenerPerfil,
        actualizarPerfil,
        solicitarRecuperacion,
        restablecerPassword,
    });

    // Registrar rutas
    app.use('/api/auth', AuthRoutes(authController));
    app.use('/api/admin', UsuarioRoutes(usuarioController));
};
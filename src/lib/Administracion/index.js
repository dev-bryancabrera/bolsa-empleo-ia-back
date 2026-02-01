const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize.js');
const UsuarioRepositorySequelize = require('./infrastructure/AdministracionRepositorySequelize.js');
const CrearUsuario = require('./application/use-cases/CrearUsuario.js');
const ListarUsuarios = require('./application/use-cases/ListarUsuarios.js');
const ObtenerUsuario = require('./application/use-cases/ObtenerUsuario.js');
const ObtenerUsuarioPersona = require('./application/use-cases/ObtenerUsuarioPersona.js');
const ActualizarUsuario = require('./application/use-cases/ActualizarUsuario.js');
const EliminarUsuario = require('./application/use-cases/EliminarUsuario.js');
const UsuarioController = require('./infrastructure/http/controller/AdministracionController.js');

const UsuarioRoutes = require("./infrastructure/http/routes/administracion.routes.js");

// Infraestructura
const personaRepository = new PersonaRepositorySequelize();
const usuarioRepository = new UsuarioRepositorySequelize();

module.exports = function registerAdministracionModule(app) {

    // Casos de uso
    const crearUsuario = new CrearUsuario(usuarioRepository, personaRepository);
    const listarUsuarios = new ListarUsuarios(usuarioRepository);
    const obtenerUsuario = new ObtenerUsuario(usuarioRepository);
    const obtenerUsuarioPorPersona = new ObtenerUsuarioPersona(usuarioRepository);
    const actualizarUsuario = new ActualizarUsuario(usuarioRepository, personaRepository);
    const eliminarUsuario = new EliminarUsuario(usuarioRepository);

    // Controller
    const usuarioController = new UsuarioController({
        crearUsuario,
        listarUsuarios,
        obtenerUsuario,
        obtenerUsuarioPorPersona,
        actualizarUsuario,
        eliminarUsuario,
    });

    app.use("/api/admin", UsuarioRoutes(usuarioController));
};

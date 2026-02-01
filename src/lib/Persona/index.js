const PersonaRepositorySequelize = require('./infrastructure/PersonaRepositorySequelize');
const CrearPersona = require('./application/use-cases/CrearPersona');
const ListarPersonas = require('./application/use-cases/ListarPersonas');
const ObtenerPersona = require('./application/use-cases/ObtenerPersona');
const ActualizarPersona = require('./application/use-cases/ActualizarPersona');
const EliminarPersona = require('./application/use-cases/EliminarPersona');
const PersonaController = require('./infrastructure/http/controller/PersonaController');

const PersonaRoutes = require("./infrastructure/http/routes/persona.routes");

module.exports = function registerPersonaModule(app) {
    // Infraestructura
    const personaRepository = new PersonaRepositorySequelize();

    // Casos de uso
    const crearPersona = new CrearPersona(personaRepository);
    const listarPersonas = new ListarPersonas(personaRepository);
    const obtenerPersona = new ObtenerPersona(personaRepository);
    const actualizarPersona = new ActualizarPersona(personaRepository);
    const eliminarPersona = new EliminarPersona(personaRepository);

    // Controller
    const personaController = new PersonaController({
        crearPersona,
        listarPersonas,
        obtenerPersona,
        actualizarPersona,
        eliminarPersona,
    });

    app.use("/api/persona", PersonaRoutes(personaController));
};

// Repository Sequelize CV
const CVRepositorySequelize = require('./infrastructure/CVRepositorySequelize');
const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');

// Casos de uso CV
const CrearCV = require('./application/use-cases/cv/CrearCV');
const ActualizarCV = require('./application/use-cases/cv/ActualizarCV');
const EliminarCV = require('./application/use-cases/cv/EliminarCV');
const ListarCV = require('./application/use-cases/cv/ListarCV');
const ObtenerCVPersona = require('./application/use-cases/cv/ObtenerCVPersona');
const ObtenerCV = require('./application/use-cases/cv/ObtenerCV');

// Controlador CV
const CVController = require('./infrastructure/http/controllers/CVController');

// Rutas CV
const CVRoutes = require("./infrastructure/http/routes/cv.routes");

// Repository Sequelize Habilidades
const HabilidadesRepositorySequelize = require('./infrastructure/HabilidadesRepositorySequelize');

// Casos de uso Habilidades
const CrearHabilidad = require('./application/use-cases/habilidades/CrearHabilidad');
const ActualizarHabilidad = require('./application/use-cases/habilidades/ActualizarHabilidad');
const EliminarHabilidad = require('./application/use-cases/habilidades/EliminarHabilidad');
const ListarHabilidades = require('./application/use-cases/habilidades/ListarHabilidades');
const ObtenerHabilidad = require('./application/use-cases/habilidades/ObtenerHabilidad');
const ObtenerHabilidadesPorCV = require('./application/use-cases/habilidades/ObtenerHabilidadesPorCV');

// Controlador Habilidades
const HabilidadesController = require('./infrastructure/http/controllers/HabilidadesController');

// Rutas Habilidades
const HabilidadesRoutes = require("./infrastructure/http/routes/habilidades.routes");

module.exports = function registerCVModule(app) {
    /* MÓDULO CV */

    // Infraestructura CV
    const cvRepository = new CVRepositorySequelize();
    const personaRepository = new PersonaRepositorySequelize();

    // Casos de uso CV
    const crearCV = new CrearCV(cvRepository, personaRepository);
    const actualizarCV = new ActualizarCV(cvRepository, personaRepository);
    const eliminarCV = new EliminarCV(cvRepository, personaRepository);
    const listarCV = new ListarCV(cvRepository);
    const obtenerCVPersona = new ObtenerCVPersona(cvRepository);
    const obtenerCV = new ObtenerCV(cvRepository);

    // Controller CV
    const cvController = new CVController({
        crearCV,
        listarCV,
        obtenerCV,
        obtenerCVPersona,
        actualizarCV,
        eliminarCV,
    });

    // Rutas CV
    app.use("/api/cv", CVRoutes(cvController));


    /* MÓDULO HABILIDADES */

    // Infraestructura Habilidades
    const habilidadesRepository = new HabilidadesRepositorySequelize();

    // Casos de uso Habilidades
    const crearHabilidad = new CrearHabilidad(habilidadesRepository, cvRepository);
    const actualizarHabilidad = new ActualizarHabilidad(habilidadesRepository);
    const eliminarHabilidad = new EliminarHabilidad(habilidadesRepository);
    const listarHabilidades = new ListarHabilidades(habilidadesRepository);
    const obtenerHabilidad = new ObtenerHabilidad(habilidadesRepository);
    const obtenerHabilidadesPorCV = new ObtenerHabilidadesPorCV(habilidadesRepository);

    // Controller Habilidades
    const habilidadesController = new HabilidadesController({
        crearHabilidad,
        listarHabilidades,
        obtenerHabilidad,
        obtenerHabilidadesPorCV,
        actualizarHabilidad,
        eliminarHabilidad,
    });

    // Rutas Habilidades
    app.use("/api/habilidades", HabilidadesRoutes(habilidadesController));
};

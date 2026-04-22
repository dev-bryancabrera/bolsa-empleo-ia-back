const RutaAprendizajeRepositorySequelize = require('./infrastructure/RutaAprendizajeRepositorySequelize');
const GuardarRuta = require('./application/use-cases/GuardarRuta');
const ObtenerRutasPorPersona = require('./application/use-cases/ObtenerRutasPorPersona');
const ActualizarProgreso = require('./application/use-cases/ActualizarProgreso');
const ActualizarEstado = require('./application/use-cases/ActualizarEstado');
const EliminarRuta = require('./application/use-cases/EliminarRuta');
const RutaAprendizajeController = require('./infrastructure/http/controller/RutaAprendizajeController');
const RutaRoutes = require('./infrastructure/http/routes/ruta.routes');

module.exports = function registerRutaAprendizajeModule(app) {
    const rutaRepository = new RutaAprendizajeRepositorySequelize();

    const guardarRuta = new GuardarRuta(rutaRepository);
    const obtenerRutasPorPersona = new ObtenerRutasPorPersona(rutaRepository);
    const actualizarProgreso = new ActualizarProgreso(rutaRepository);
    const actualizarEstado = new ActualizarEstado(rutaRepository);
    const eliminarRuta = new EliminarRuta(rutaRepository);

    const rutaController = new RutaAprendizajeController({
        guardarRuta,
        obtenerRutasPorPersona,
        actualizarProgreso,
        actualizarEstado,
        eliminarRuta,
    });

    app.use('/api/ruta-aprendizaje', RutaRoutes(rutaController));
};

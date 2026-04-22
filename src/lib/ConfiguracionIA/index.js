const ConfiguracionIARepositorySequelize = require('./infrastructure/repositories/ConfiguracionIARepositorySequelize');
const ObtenerConfiguracion = require('./application/use-cases/ObtenerConfiguracion');
const ValidarYGuardarConfiguracion = require('./application/use-cases/ValidarYGuardarConfiguracion');
const ConfiguracionIAController = require('./infrastructure/http/controllers/ConfiguracionIAController');
const ConfiguracionIARoutes = require('./infrastructure/http/routes/configuracion.routes');

module.exports = function registerConfiguracionIAModule(app) {
    const configuracionRepository = new ConfiguracionIARepositorySequelize();

    const obtenerConfiguracion = new ObtenerConfiguracion(configuracionRepository);
    const validarYGuardar = new ValidarYGuardarConfiguracion(configuracionRepository);

    const controller = new ConfiguracionIAController({ obtenerConfiguracion, validarYGuardar });

    app.use('/api/configuracion-ia', ConfiguracionIARoutes(controller));
};

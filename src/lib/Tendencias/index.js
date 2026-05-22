const TendenciaRepositorySequelize = require('./infrastructure/TendenciaRepositorySequelize');
const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');
const CVRepositorySequelize = require('../CV/infrastructure/CVRepositorySequelize');
const HabilidadesRepositorySequelize = require('../CV/infrastructure/HabilidadesRepositorySequelize');
const ConfiguracionIARepositorySequelize = require('../ConfiguracionIA/infrastructure/repositories/ConfiguracionIARepositorySequelize');
const GroqService = require('../../infrastructure/services/GroqService');

const GenerarTendencias = require('./application/use-cases/GenerarTendencias');
const ObtenerTendencias = require('./application/use-cases/ObtenerTendencias');
const RegenerarTendencias = require('./application/use-cases/RegenerarTendencias');

const TendenciaController = require('./infrastructure/http/controller/TendenciaController');
const TendenciaRoutes = require('./infrastructure/http/routes/tendencia.routes');

module.exports = function registerTendenciaModule(app) {
    const tendenciaRepository = new TendenciaRepositorySequelize();
    const personaRepository = new PersonaRepositorySequelize();
    const cvRepository = new CVRepositorySequelize();
    const habilidadesRepository = new HabilidadesRepositorySequelize();
    const configuracionRepository = new ConfiguracionIARepositorySequelize();
    const iaService = new GroqService();

    const generarTendencias = new GenerarTendencias(
        tendenciaRepository,
        personaRepository,
        cvRepository,
        habilidadesRepository,
        iaService,
        configuracionRepository
    );

    const obtenerTendencias = new ObtenerTendencias(tendenciaRepository);
    const regenerarTendencias = new RegenerarTendencias(tendenciaRepository, generarTendencias);

    const tendenciaController = new TendenciaController({
        generarTendencias,
        obtenerTendencias,
        regenerarTendencias
    });

    app.use('/api/tendencias', TendenciaRoutes(tendenciaController));
};

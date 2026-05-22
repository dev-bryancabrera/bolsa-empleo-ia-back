// ── Repositorios ──
const PortfolioRepositorySequelize = require('./infrastructure/PortfolioRepositorySequelize');
const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');
const CVRepositorySequelize = require('../CV/infrastructure/CVRepositorySequelize');
const HabilidadesRepositorySequelize = require('../CV/infrastructure/HabilidadesRepositorySequelize');
const ExperienciaLaboralRepository = require('../CV/infrastructure/ExperienciaLaboralRepository');
const EducacionRepository = require('../CV/infrastructure/EducacionRepository');
const IdiomaRepository = require('../CV/infrastructure/IdiomaRepository');
const CertificacionRepository = require('../CV/infrastructure/CertificacionRepository');

// ── Casos de uso ──
const CrearPortafolio = require('./application/use-cases/CrearPortafolio');
const ObtenerPortafolio = require('./application/use-cases/ObtenerPortafolio');
const ObtenerPortafolioPublico = require('./application/use-cases/ObtenerPortafolioPublico');
const ActualizarPortafolio = require('./application/use-cases/ActualizarPortafolio');
const OptimizarPortafolio = require('./application/use-cases/OptimizarPortafolio');
const ObtenerDatosEditor = require('./application/use-cases/ObtenerDatosEditor');

// ── Servicio IA ──
const GroqService = require('../../infrastructure/services/GroqService');
const ConfiguracionIARepositorySequelize = require('../ConfiguracionIA/infrastructure/repositories/ConfiguracionIARepositorySequelize');

// ── HTTP ──
const PortfolioController = require('./infrastructure/http/controllers/PortfolioController');
const PortfolioRoutes = require('./infrastructure/http/routes/portfolio.routes');

function registerPortfolioModule(app) {
    // Instanciar repositorios
    const portfolioRepository = new PortfolioRepositorySequelize();
    const personaRepository = new PersonaRepositorySequelize();
    const cvRepository = new CVRepositorySequelize();
    const habilidadesRepository = new HabilidadesRepositorySequelize();
    const experienciaRepository = new ExperienciaLaboralRepository();
    const educacionRepository = new EducacionRepository();
    const idiomaRepository = new IdiomaRepository();
    const certificacionRepository = new CertificacionRepository();
    const iaService = new GroqService();
    const configuracionRepository = new ConfiguracionIARepositorySequelize();

    // Instanciar casos de uso
    const crearPortafolio = new CrearPortafolio(portfolioRepository, personaRepository);
    const obtenerPortafolio = new ObtenerPortafolio(portfolioRepository);
    const obtenerPortafolioPublico = new ObtenerPortafolioPublico(
        portfolioRepository, personaRepository, cvRepository,
        habilidadesRepository, experienciaRepository, educacionRepository,
        idiomaRepository, certificacionRepository
    );
    const actualizarPortafolio = new ActualizarPortafolio(portfolioRepository);
    const obtenerDatosEditor = new ObtenerDatosEditor(
        personaRepository, cvRepository, habilidadesRepository,
        experienciaRepository, educacionRepository, idiomaRepository, certificacionRepository
    );
    const optimizarPortafolio = new OptimizarPortafolio(
        portfolioRepository, cvRepository, habilidadesRepository,
        iaService, configuracionRepository
    );

    // Instanciar controller
    const portfolioController = new PortfolioController({
        crearPortafolio,
        obtenerPortafolio,
        obtenerPortafolioPublico,
        actualizarPortafolio,
        optimizarPortafolio,
        obtenerDatosEditor,
    });

    app.use('/api/portfolio', PortfolioRoutes(portfolioController));
}

module.exports = registerPortfolioModule;

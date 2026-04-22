// ── Repositorios ──
const CVRepositorySequelize = require('./infrastructure/CVRepositorySequelize');
const HabilidadesRepositorySequelize = require('./infrastructure/HabilidadesRepositorySequelize');
const PersonaRepositorySequelize = require('../Persona/infrastructure/PersonaRepositorySequelize');
const ExperienciaLaboralRepository = require('./infrastructure/ExperienciaLaboralRepository');
const EducacionRepository = require('./infrastructure/EducacionRepository');
const IdiomaRepository = require('./infrastructure/IdiomaRepository');
const CertificacionRepository = require('./infrastructure/CertificacionRepository');

// ── Casos de uso CV ──
const CrearCV = require('./application/use-cases/cv/CrearCV');
const ActualizarCV = require('./application/use-cases/cv/ActualizarCV');
const EliminarCV = require('./application/use-cases/cv/EliminarCV');
const ListarCV = require('./application/use-cases/cv/ListarCV');
const ObtenerCVPersona = require('./application/use-cases/cv/ObtenerCVPersona');
const ObtenerCVCompletoPorUsuario = require('./application/use-cases/cv/ObternerCVCompletoPorUsuario');
const ObtenerCV = require('./application/use-cases/cv/ObtenerCV');

// ── Casos de uso IA ──
const ValidarCV = require('./application/use-cases/cv/ValidarCV');
const ValidarCVArchivo = require('./application/use-cases/cv/ValidarCVArchivo');
const VerificarCompatibilidad = require('./application/use-cases/cv/VerificarCompatibilidad');
const ExtraerCV = require('./application/use-cases/cv/ExtraerCV');
const ImportarCV = require('./application/use-cases/cv/ImportarCV');

// ── Casos de uso Habilidades ──
const CrearHabilidad = require('./application/use-cases/habilidades/CrearHabilidad');
const ActualizarHabilidad = require('./application/use-cases/habilidades/ActualizarHabilidad');
const EliminarHabilidad = require('./application/use-cases/habilidades/EliminarHabilidad');
const ListarHabilidades = require('./application/use-cases/habilidades/ListarHabilidades');
const ObtenerHabilidad = require('./application/use-cases/habilidades/ObtenerHabilidad');
const ObtenerHabilidadesPorCV = require('./application/use-cases/habilidades/ObtenerHabilidadesPorCV');

// ── Casos de uso Experiencia Laboral ──
const CrearExperiencia = require('./application/use-cases/experiencia/CrearExperiencia');
const ActualizarExperiencia = require('./application/use-cases/experiencia/ActualizarExperiencia');
const EliminarExperiencia = require('./application/use-cases/experiencia/EliminarExperiencia');
const ListarExperienciasPorCV = require('./application/use-cases/experiencia/ListarExperienciasPorCV');

// ── Casos de uso Educación ──
const CrearEducacion = require('./application/use-cases/educacion/CrearEducacion');
const ActualizarEducacion = require('./application/use-cases/educacion/ActualizarEducacion');
const EliminarEducacion = require('./application/use-cases/educacion/EliminarEducacion');
const ListarEducacionesPorCV = require('./application/use-cases/educacion/ListarEducacionesPorCV');

// ── Casos de uso Idioma ──
const CrearIdioma = require('./application/use-cases/idioma/CrearIdioma');
const ActualizarIdioma = require('./application/use-cases/idioma/ActualizarIdioma');
const EliminarIdioma = require('./application/use-cases/idioma/EliminarIdioma');
const ListarIdiomasPorCV = require('./application/use-cases/idioma/ListarIdiomasPorCV');

// ── Casos de uso Certificación ──
const CrearCertificacion = require('./application/use-cases/certificacion/CrearCertificacion');
const ActualizarCertificacion = require('./application/use-cases/certificacion/ActualizarCertificacion');
const EliminarCertificacion = require('./application/use-cases/certificacion/EliminarCertificacion');
const ListarCertificacionesPorCV = require('./application/use-cases/certificacion/ListarCertificacionesPorCV');

// ── Servicio IA ──
const GroqService = require('../../infrastructure/services/GroqService');

// ── Controladores ──
const CVController = require('./infrastructure/http/controllers/CVController');
const HabilidadesController = require('./infrastructure/http/controllers/HabilidadesController');
const ExperienciaLaboralController = require('./infrastructure/http/controllers/ExperienciaLaboralController');
const EducacionController = require('./infrastructure/http/controllers/EducacionController');
const IdiomaController = require('./infrastructure/http/controllers/IdiomaController');
const CertificacionController = require('./infrastructure/http/controllers/CertificacionController');

// ── Rutas ──
const CVRoutes = require("./infrastructure/http/routes/cv.routes");
const HabilidadesRoutes = require("./infrastructure/http/routes/habilidades.routes");
const ExperienciaRoutes = require("./infrastructure/http/routes/experiencia.routes");
const EducacionRoutes = require("./infrastructure/http/routes/educacion.routes");
const IdiomaRoutes = require("./infrastructure/http/routes/idioma.routes");
const CertificacionRoutes = require("./infrastructure/http/routes/certificacion.routes");

module.exports = function registerCVModule(app) {

    /* ── Infraestructura compartida ── */
    const cvRepository = new CVRepositorySequelize();
    const habilidadesRepository = new HabilidadesRepositorySequelize();
    const personaRepository = new PersonaRepositorySequelize();
    const iaService = new GroqService();
    const experienciaRepository = new ExperienciaLaboralRepository();
    const educacionRepository = new EducacionRepository();
    const idiomaRepository = new IdiomaRepository();
    const certificacionRepository = new CertificacionRepository();

    /* ── MÓDULO CV ── */

    // Casos de uso CRUD
    const crearCV = new CrearCV(cvRepository, personaRepository);
    const actualizarCV = new ActualizarCV(cvRepository, personaRepository);
    const eliminarCV = new EliminarCV(cvRepository, personaRepository);
    const listarCV = new ListarCV(cvRepository);
    const obtenerCVPersona = new ObtenerCVPersona(cvRepository);
    const obtenerCVCompletoPorUsuario = new ObtenerCVCompletoPorUsuario(cvRepository);
    const obtenerCV = new ObtenerCV(cvRepository);

    // Casos de uso IA
    const validarCV = new ValidarCV(cvRepository, iaService);
    const validarCVArchivo = new ValidarCVArchivo(iaService);
    const verificarCompatibilidad = new VerificarCompatibilidad(cvRepository, iaService);
    const extraerCV = new ExtraerCV(iaService);
    const importarCV = new ImportarCV(cvRepository, habilidadesRepository, personaRepository);

    const cvController = new CVController({
        crearCV,
        listarCV: listarCV,
        obtenerCV,
        obtenerCVPersona,
        obtenerCVCompletoPorUsuario,
        actualizarCV,
        eliminarCV,
        validarCV,
        validarCVArchivo,
        verificarCompatibilidad,
        extraerCV,
        importarCV,
    });

    app.use("/api/cv", CVRoutes(cvController));

    /* ── MÓDULO HABILIDADES ── */

    const crearHabilidad = new CrearHabilidad(habilidadesRepository, cvRepository);
    const actualizarHabilidad = new ActualizarHabilidad(habilidadesRepository);
    const eliminarHabilidad = new EliminarHabilidad(habilidadesRepository);
    const listarHabilidades = new ListarHabilidades(habilidadesRepository);
    const obtenerHabilidad = new ObtenerHabilidad(habilidadesRepository);
    const obtenerHabilidadesPorCV = new ObtenerHabilidadesPorCV(habilidadesRepository);

    const habilidadesController = new HabilidadesController({
        crearHabilidad,
        listarHabilidades,
        obtenerHabilidad,
        obtenerHabilidadesPorCV,
        actualizarHabilidad,
        eliminarHabilidad,
    });

    app.use("/api/habilidades", HabilidadesRoutes(habilidadesController));

    /* ── MÓDULO EXPERIENCIA LABORAL ── */

    const crearExperiencia = new CrearExperiencia(experienciaRepository);
    const actualizarExperiencia = new ActualizarExperiencia(experienciaRepository);
    const eliminarExperiencia = new EliminarExperiencia(experienciaRepository);
    const listarExperienciasPorCV = new ListarExperienciasPorCV(experienciaRepository);

    const experienciaController = new ExperienciaLaboralController({
        crear: crearExperiencia,
        listarPorCV: listarExperienciasPorCV,
        actualizar: actualizarExperiencia,
        eliminar: eliminarExperiencia,
    });

    app.use("/api/experiencia-laboral", ExperienciaRoutes(experienciaController));

    /* ── MÓDULO EDUCACIÓN ── */

    const crearEducacion = new CrearEducacion(educacionRepository);
    const actualizarEducacion = new ActualizarEducacion(educacionRepository);
    const eliminarEducacion = new EliminarEducacion(educacionRepository);
    const listarEducacionesPorCV = new ListarEducacionesPorCV(educacionRepository);

    const educacionController = new EducacionController({
        crear: crearEducacion,
        listarPorCV: listarEducacionesPorCV,
        actualizar: actualizarEducacion,
        eliminar: eliminarEducacion,
    });

    app.use("/api/educacion-cv", EducacionRoutes(educacionController));

    /* ── MÓDULO IDIOMAS ── */

    const crearIdioma = new CrearIdioma(idiomaRepository);
    const actualizarIdioma = new ActualizarIdioma(idiomaRepository);
    const eliminarIdioma = new EliminarIdioma(idiomaRepository);
    const listarIdiomasPorCV = new ListarIdiomasPorCV(idiomaRepository);

    const idiomaController = new IdiomaController({
        crear: crearIdioma,
        listarPorCV: listarIdiomasPorCV,
        actualizar: actualizarIdioma,
        eliminar: eliminarIdioma,
    });

    app.use("/api/idiomas-cv", IdiomaRoutes(idiomaController));

    /* ── MÓDULO CERTIFICACIONES ── */

    const crearCertificacion = new CrearCertificacion(certificacionRepository);
    const actualizarCertificacion = new ActualizarCertificacion(certificacionRepository);
    const eliminarCertificacion = new EliminarCertificacion(certificacionRepository);
    const listarCertificacionesPorCV = new ListarCertificacionesPorCV(certificacionRepository);

    const certController = new CertificacionController({
        crear: crearCertificacion,
        listarPorCV: listarCertificacionesPorCV,
        actualizar: actualizarCertificacion,
        eliminar: eliminarCertificacion,
    });

    app.use("/api/certificaciones-cv", CertificacionRoutes(certController));
};

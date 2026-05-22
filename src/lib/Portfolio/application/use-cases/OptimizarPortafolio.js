const IAServiceFactory = require('../../../../infrastructure/services/IAServiceFactory');

class OptimizarPortafolio {
    constructor(portfolioRepository, cvRepository, habilidadesRepository, iaService, configuracionRepository = null) {
        this.portfolioRepository = portfolioRepository;
        this.cvRepository = cvRepository;
        this.habilidadesRepository = habilidadesRepository;
        this.iaService = iaService;
        this.configuracionRepository = configuracionRepository;
    }

    async execute(personaId) {
        const [portfolio, cv] = await Promise.all([
            this.portfolioRepository.obtenerPorPersonaId(personaId),
            this.cvRepository.obtenerPorPersonaId(personaId),
        ]);

        if (!portfolio) throw new Error('PORTFOLIO_NOT_FOUND');
        if (!cv) throw new Error('CV_NOT_FOUND');

        const habilidades = await this.habilidadesRepository.obtenerPorCVId(cv.id).catch(() => []);

        let servicioIA = this.iaService;
        if (this.configuracionRepository) {
            servicioIA = await IAServiceFactory.crearServicioParaPersona(personaId, this.configuracionRepository);
        }

        const prompt = this._construirPrompt(cv, habilidades, portfolio);
        const promptSistema = `Eres un experto en personal branding digital y portfolios profesionales para el mercado latinoamericano 2025-2026. Tu especialidad es optimizar la presencia online de profesionales para atraer reclutadores y clientes. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional.`;

        const respuestaIA = await servicioIA.generarRespuesta(prompt, promptSistema, { maxTokens: 3000, jsonMode: true });
        return this._parsearRespuesta(respuestaIA);
    }

    _construirPrompt(cv, habilidades, portfolio) {
        const habilidadesTexto = habilidades.map(h => h.nombre).join(', ') || 'No especificadas';
        const contenido = portfolio.contenido_extra || {};
        const anio = new Date().getFullYear();

        return `Analiza este perfil profesional y optimiza su portafolio web personal para el mercado latinoamericano ${anio}.

PERFIL:
- Título: ${cv.titulo_profesional || 'No especificado'}
- Sector: ${cv.sector_profesional || 'No especificado'}
- Experiencia: ${cv.anios_experiencia || 0} años
- Resumen actual: "${cv.resumen_profesional || 'Sin resumen'}"
- Habilidades: ${habilidadesTexto}

CONTENIDO ACTUAL DEL PORTAFOLIO:
- Bio extendida: "${contenido.bio_extendida || 'Vacía'}"
- Título hero: "${contenido.titulo_hero || 'Vacío'}"
- Frase motivacional: "${contenido.frase_motivacional || 'Vacía'}"
- Proyectos custom: ${(contenido.proyectos_custom || []).length} proyectos

Genera mejoras específicas para este portafolio. Responde con este JSON exacto:
{
  "titulo_hero_mejorado": "string — titular impactante para el hero section, max 10 palabras",
  "bio_extendida_mejorada": "string — bio profesional optimizada para personal branding, 3-4 oraciones, primera persona",
  "frase_motivacional_mejorada": "string — frase que refleje propuesta de valor única, max 20 palabras",
  "secciones_recomendadas": {
    "resumen": true,
    "experiencia": true,
    "educacion": true,
    "habilidades": true,
    "idiomas": true,
    "certificaciones": true,
    "proyectos_custom": true,
    "contacto": true
  },
  "orden_secciones_recomendado": ["string"],
  "plantilla_recomendada": "minimalista|profesional|creativo",
  "razon_plantilla": "string — por qué esta plantilla para este perfil",
  "tips_proyectos": ["string — consejo para describir proyectos con impacto"],
  "keywords_para_incluir": ["string — keywords SEO para el sector en ${anio}"],
  "score_antes": number (0-100, calidad actual del portafolio),
  "score_despues": number (0-100, calidad estimada con mejoras),
  "resumen_mejoras": "string — párrafo breve explicando el impacto de las mejoras"
}`;
    }

    _parsearRespuesta(respuesta) {
        try {
            const limpia = respuesta.trim()
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '');
            const datos = JSON.parse(limpia);
            if (!datos.titulo_hero_mejorado || !datos.bio_extendida_mejorada) {
                throw new Error('Respuesta incompleta de IA');
            }
            return datos;
        } catch (error) {
            console.error('Error parseando respuesta de IA:', error);
            throw new Error('No se pudo procesar la respuesta de la IA');
        }
    }
}

module.exports = OptimizarPortafolio;

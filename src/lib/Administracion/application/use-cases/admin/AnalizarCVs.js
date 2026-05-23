const CVModel = require('../../../../../infrastructure/models/CVModel');
const HabilidadesModel = require('../../../../../infrastructure/models/HabilidadesModel');
const ExperienciaLaboralModel = require('../../../../../infrastructure/models/ExperienciaLaboralModel');
const EducacionModel = require('../../../../../infrastructure/models/EducacionModel');

class AnalizarCVs {
    constructor(groqService) {
        this.groqService = groqService;
    }

    async execute(consulta = '¿Cuál es el análisis general de los CVs cargados en la plataforma?') {
        const rows = await CVModel.findAll({
            include: [
                { model: HabilidadesModel, as: 'habilidades', attributes: ['nombre', 'categoria', 'nivel'] },
                { model: ExperienciaLaboralModel, as: 'experiencias', attributes: ['cargo', 'empresa', 'anios_experiencia'] },
                { model: EducacionModel, as: 'educaciones', attributes: ['titulo', 'institucion', 'nivel'] },
            ],
        });

        if (rows.length === 0) {
            return {
                total_cvs: 0,
                resumen: 'No hay CVs registrados en la plataforma todavía.',
                profesiones_top: [],
                sectores_top: [],
                habilidades_mas_comunes: [],
                insights: [],
            };
        }

        const datos = rows.map(row => {
            const cv = row.get({ plain: true });
            return {
                titulo_profesional: cv.titulo_profesional || 'Sin título',
                sector_profesional: cv.sector_profesional || 'Sin sector',
                nivel_educacion: cv.nivel_educacion || 'No especificado',
                anios_experiencia: cv.anios_experiencia ?? 0,
                ciudad: cv.ciudad || '',
                pais: cv.pais || '',
                habilidades: (cv.habilidades || []).map(h => h.nombre),
                tiene_experiencia: (cv.experiencias || []).length > 0,
                tiene_educacion: (cv.educaciones || []).length > 0,
            };
        });

        const resumenTexto = JSON.stringify(datos, null, 2);

        const promptSistema = `Eres un analista experto en recursos humanos y mercado laboral.
Recibirás datos de CVs de una plataforma de empleo y debes analizar las tendencias y patrones.
IMPORTANTE: Responde SIEMPRE en español y con formato JSON válido exactamente como se especifica.`;

        const mensajeUsuario = `Tienes ${rows.length} CVs de la plataforma. Aquí están los datos resumidos:

${resumenTexto}

CONSULTA DEL ADMINISTRADOR: ${consulta}

Responde con este JSON exacto:
{
  "total_cvs": ${rows.length},
  "resumen_general": "párrafo de 2-3 oraciones resumiendo el perfil general de la plataforma",
  "respuesta_consulta": "respuesta específica a la consulta del administrador",
  "profesiones_top": [
    {"nombre": "...", "cantidad": 0, "porcentaje": 0}
  ],
  "sectores_top": [
    {"sector": "...", "cantidad": 0}
  ],
  "habilidades_mas_comunes": [
    {"habilidad": "...", "cantidad": 0}
  ],
  "distribucion_experiencia": {
    "junior_0_2": 0,
    "mid_3_5": 0,
    "senior_6_mas": 0
  },
  "distribucion_educacion": {
    "basica": 0,
    "tecnico": 0,
    "universitario": 0,
    "postgrado": 0
  },
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recomendaciones": "recomendación para mejorar la plataforma o los perfiles"
}`;

        const respuesta = await this.groqService.generarRespuesta(
            mensajeUsuario,
            promptSistema,
            { maxTokens: 2000, jsonMode: true }
        );

        return JSON.parse(respuesta);
    }
}

module.exports = AnalizarCVs;

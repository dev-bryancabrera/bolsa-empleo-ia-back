const CVModel = require('../../../../../infrastructure/models/CVModel');
const HabilidadesModel = require('../../../../../infrastructure/models/HabilidadesModel');
const ExperienciaLaboralModel = require('../../../../../infrastructure/models/ExperienciaLaboralModel');
const EducacionModel = require('../../../../../infrastructure/models/EducacionModel');
const GeminiService = require('../../../../../infrastructure/services/GeminiService');
// const KimiService = require('../../../../../infrastructure/services/KimiService');

class AnalizarCVs {
    constructor(groqService) {
        this.groqService = groqService;
    }

    async execute(consulta = '¿Cuál es el análisis general de los CVs cargados en la plataforma?') {
        const rows = await CVModel.findAll({
            include: [
                { model: HabilidadesModel, as: 'habilidades', attributes: ['nombre', 'categoria', 'nivel'] },
                { model: ExperienciaLaboralModel, as: 'experiencias', attributes: ['cargo', 'empresa', 'fecha_inicio', 'fecha_fin', 'es_trabajo_actual'] },
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

        const promptSistema = `Eres un analista senior de recursos humanos y mercado laboral de Ecuador y Latinoamérica. Usas el marco ESCO (European Skills, Competences, Qualifications and Occupations) adaptado a Latam como taxonomía estándar para clasificar competencias y medir brechas.

TAXONOMÍA K-S-C de ESCO:
  K (Knowledge): conocimiento conceptual — lo que el profesional sabe
  S (Skill): habilidad técnica aplicada — lo que puede hacer
  C (Competence): autonomía al aplicar K o S — cómo lo aplica

ALGORITMO DE BRECHA COMPETENCIAL ESCO-LAT:
  gap_score por competencia = max(0, nivel_requerido − nivel_actual) [escala 1-4 EQF]
  gap_plataforma = Σ gap_scores promedio de todos los CVs por ocupación
  Usa este algoritmo para identificar qué sectores tienen mayores brechas colectivas.

INSTRUCCIÓN: Responde SIEMPRE en español y con formato JSON válido exactamente como se especifica.`;

        const mensajeUsuario = `Tienes ${rows.length} CVs de la plataforma. Aquí están los datos resumidos (contexto RAG):

${resumenTexto}

CONSULTA DEL ADMINISTRADOR: ${consulta}

Analiza los datos usando el marco ESCO-LAT y responde con este JSON exacto:
{
  "total_cvs": ${rows.length},
  "resumen_general": "párrafo de 2-3 oraciones resumiendo el perfil general de la plataforma",
  "respuesta_consulta": "respuesta específica a la consulta del administrador, aplicando el marco ESCO si es relevante",
  "profesiones_top": [
    {"nombre": "...", "cantidad": 0, "porcentaje": 0}
  ],
  "sectores_top": [
    {"sector": "...", "cantidad": 0}
  ],
  "habilidades_mas_comunes": [
    {
      "habilidad": "...",
      "cantidad": 0,
      "tipo_esco": "K|S|C"
    }
  ],
  "brechas_colectivas": [
    {
      "competencia": "habilidad o conocimiento que falta en la mayoría de perfiles",
      "tipo_esco": "K|S|C",
      "porcentaje_sin_esta_skill": 0,
      "demanda_mercado": "Alta|Media|Emergente",
      "impacto_empleabilidad": "Alto|Medio|Bajo"
    }
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
  "insights": ["insight 1 con perspectiva ESCO", "insight 2", "insight 3"],
  "recomendaciones": "recomendación para mejorar los perfiles de la plataforma, basada en las brechas colectivas identificadas"
}`;

        let respuesta;
        try {
            const gemini = new GeminiService(process.env.GEMINI_API_KEY, 'gemini-2.0-flash');
            respuesta = await gemini.generarRespuesta(mensajeUsuario, promptSistema, { maxTokens: 4000, jsonMode: true });
        } catch (errGemini) {
            console.warn('⚠️ Gemini no disponible para análisis CV — usando Groq como fallback');
            respuesta = await this.groqService.generarRespuesta(mensajeUsuario, promptSistema, { maxTokens: 2000, jsonMode: true });
        }

        return JSON.parse(respuesta);
    }
}

module.exports = AnalizarCVs;

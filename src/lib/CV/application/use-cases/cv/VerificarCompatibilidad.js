const axios = require('axios');

class VerificarCompatibilidad {
    constructor(cvRepository, iaService) {
        this.cvRepository = cvRepository;
        this.iaService = iaService;
    }

    async execute(cvId, urlVacante) {
        // 1. Obtener CV y habilidades
        const cv = await this.cvRepository.obtenerPorId(cvId);
        if (!cv) throw new Error('CV no encontrado');

        const habilidades = await this.cvRepository.obtenerHabilidades(cvId);

        // 2. Obtener contenido de la vacante
        const contenidoVacante = await this._fetchVacante(urlVacante);

        // 3. Construir prompt y analizar con IA
        const textoCv = this._buildCvText(cv, habilidades);

        const promptSistema = `Eres un experto en reclutamiento y selección de personal.
Tu tarea es analizar la compatibilidad entre un perfil profesional (CV) y una oferta de trabajo.

IMPORTANTE: Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown.

El JSON debe tener exactamente esta estructura:
{
  "puntuacion": <número del 0 al 100>,
  "nivel": <"alta" | "media" | "baja">,
  "puesto": <string con el nombre del puesto identificado>,
  "empresa": <string con el nombre de la empresa o vacío "">,
  "habilidades_match": [<strings de habilidades que el candidato tiene y el puesto requiere>],
  "habilidades_faltantes": [<strings de habilidades que el puesto requiere pero el candidato no tiene>],
  "requisitos_match": [<strings de requisitos que el candidato cumple>],
  "requisitos_faltantes": [<strings de requisitos que el candidato no cumple>],
  "recomendaciones": [<strings con acciones concretas para mejorar la candidatura>],
  "resumen": <string de 2-3 oraciones resumiendo el análisis>
}

Criterios nivel:
- alta: 70-100
- media: 40-69
- baja: 0-39

Genera entre 2 y 5 recomendaciones específicas.`;

        const mensajeUsuario = `PERFIL DEL CANDIDATO:
${textoCv}

OFERTA DE TRABAJO:
${contenidoVacante.substring(0, 3000)}`;

        const respuestaRaw = await this.iaService.generarRespuesta(mensajeUsuario, promptSistema, {
            maxTokens: 1800,
            jsonMode: true
        });

        return this._parseRespuesta(respuestaRaw);
    }

    async _fetchVacante(url) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                }
            });

            // Limpiar HTML: eliminar tags, scripts, estilos y espacios extra
            let texto = response.data
                .replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (texto.length < 100) {
                throw new Error('El contenido de la página es muy corto o no se pudo extraer');
            }

            return texto;
        } catch (error) {
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error('La página tardó demasiado en responder. Intenta con otro enlace.');
            }
            if (error.response?.status === 403 || error.response?.status === 401) {
                throw new Error('Esta página requiere autenticación y no puede ser accedida directamente. Copia y pega la descripción de la vacante manualmente.');
            }
            if (error.response?.status === 404) {
                throw new Error('La URL de la vacante no existe o fue eliminada.');
            }
            throw new Error(`No se pudo acceder a la vacante: ${error.message}`);
        }
    }

    _buildCvText(cv, habilidades) {
        const habilidadesTexto = habilidades.length > 0
            ? habilidades.map(h => `  - ${h.nombre} (${h.categoria}, ${h.nivel}, ${h.anios_experiencia} años)`).join('\n')
            : '  (sin habilidades registradas)';

        return `
Título: ${cv.titulo_profesional || 'No especificado'}
Resumen: ${cv.resumen_profesional || 'No especificado'}
Experiencia: ${cv.anios_experiencia ?? 0} años
Educación: ${cv.nivel_educacion || 'No especificado'}
Sector: ${cv.sector_profesional || 'No especificado'}
Habilidades:
${habilidadesTexto}
        `.trim();
    }

    _parseRespuesta(raw) {
        try {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

            return {
                puntuacion: Math.min(100, Math.max(0, parseInt(data.puntuacion) || 0)),
                nivel: data.nivel || 'baja',
                puesto: data.puesto || '',
                empresa: data.empresa || '',
                habilidades_match: Array.isArray(data.habilidades_match) ? data.habilidades_match : [],
                habilidades_faltantes: Array.isArray(data.habilidades_faltantes) ? data.habilidades_faltantes : [],
                requisitos_match: Array.isArray(data.requisitos_match) ? data.requisitos_match : [],
                requisitos_faltantes: Array.isArray(data.requisitos_faltantes) ? data.requisitos_faltantes : [],
                recomendaciones: Array.isArray(data.recomendaciones) ? data.recomendaciones : [],
                resumen: data.resumen || ''
            };
        } catch (e) {
            throw new Error(`Error procesando respuesta de IA: ${e.message}`);
        }
    }
}

module.exports = VerificarCompatibilidad;

class ValidarCV {
    constructor(cvRepository, iaService) {
        this.cvRepository = cvRepository;
        this.iaService = iaService;
    }

    async execute(cvId) {
        // 1. Obtener CV y habilidades
        const cv = await this.cvRepository.obtenerPorId(cvId);
        if (!cv) throw new Error('CV no encontrado');

        const habilidades = await this.cvRepository.obtenerHabilidades(cvId);

        // 2. Construir texto del CV para análisis
        const textoCv = this._buildCvText(cv, habilidades);

        // 3. Solicitar análisis a la IA
        const anio = new Date().getFullYear();
        const promptSistema = `Eres un experto en recursos humanos y selección de personal con 15 años de experiencia evaluando CVs para el mercado latinoamericano. Conoces a fondo los sistemas ATS (Applicant Tracking Systems) más modernos, los estándares actuales de LinkedIn Recruiter y las tendencias de reclutamiento vigentes y emergentes (${anio}-${anio + 1}).
Tu tarea es analizar el CV proporcionado y devolver un análisis estructurado en JSON estricto.

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional, sin markdown, sin explicaciones.

El JSON debe tener exactamente esta estructura:
{
  "score": <número del 0 al 100>,
  "nivel": <"excelente" | "bueno" | "mejorable" | "deficiente">,
  "secciones": [
    {
      "nombre": <string>,
      "estado": <"ok" | "warning" | "error">,
      "observacion": <string explicando el estado con referencia a estándares ATS actuales o tendencias vigentes>
    }
  ],
  "sugerencias": [<string>, ...]
}

Criterios para el score:
- 90-100: excelente
- 70-89: bueno
- 50-69: mejorable
- 0-49: deficiente

Evalúa estas secciones bajo los estándares ATS más actuales y tendencias de reclutamiento moderno:
- Título Profesional: ¿Incluye keywords de búsqueda? ¿Formato "Cargo | Especialidad | Tech principal"?
- Resumen Profesional: ¿Tiene propuesta de valor clara, logros cuantificados, duración máx. 5 líneas (estándar LinkedIn actual)?
- Habilidades Técnicas: ¿Incluye skills de IA generativa, cloud, automatización y tecnologías emergentes? ¿Están optimizadas para parseo ATS?
- Años de Experiencia: ¿Coherente con el nivel declarado?
- Nivel de Educación: ¿Relevante para el sector?
- Sector Definido: ¿Alineado con el mercado ecuatoriano/latinoamericano actual y su proyección hacia ${anio + 1}?
- Palabras Clave ATS: ¿El CV pasaría filtros automáticos de Workday, Greenhouse, LinkedIn Recruiter?

Genera entre 4 y 7 sugerencias concretas y accionables, referenciando las tendencias de reclutamiento más actuales y las que se proyectan para los próximos 12-24 meses.`;

        const mensajeUsuario = `Analiza el siguiente CV:\n\n${textoCv}`;

        const respuestaRaw = await this.iaService.generarRespuesta(mensajeUsuario, promptSistema, {
            maxTokens: 1500,
            jsonMode: true
        });

        // 4. Parsear respuesta JSON
        return this._parseRespuesta(respuestaRaw);
    }

    _buildCvText(cv, habilidades) {
        const habilidadesTexto = habilidades.length > 0
            ? habilidades.map(h => `  - ${h.nombre} | ${h.categoria} | ${h.nivel} | ${h.anios_experiencia} años`).join('\n')
            : '  (sin habilidades registradas)';

        return `
TÍTULO PROFESIONAL: ${cv.titulo_profesional || 'No especificado'}
RESUMEN PROFESIONAL: ${cv.resumen_profesional || 'No especificado'}
AÑOS DE EXPERIENCIA: ${cv.anios_experiencia ?? 'No especificado'}
NIVEL DE EDUCACIÓN: ${cv.nivel_educacion || 'No especificado'}
SECTOR PROFESIONAL: ${cv.sector_profesional || 'No especificado'}
HABILIDADES:
${habilidadesTexto}
        `.trim();
    }

    _parseRespuesta(raw) {
        try {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

            // Validar campos requeridos
            if (!data.score || !data.nivel || !Array.isArray(data.secciones) || !Array.isArray(data.sugerencias)) {
                throw new Error('Respuesta de IA incompleta');
            }

            return {
                score: Math.min(100, Math.max(0, parseInt(data.score))),
                nivel: data.nivel,
                secciones: data.secciones,
                sugerencias: data.sugerencias
            };
        } catch (e) {
            throw new Error(`Error procesando respuesta de IA: ${e.message}`);
        }
    }
}

module.exports = ValidarCV;

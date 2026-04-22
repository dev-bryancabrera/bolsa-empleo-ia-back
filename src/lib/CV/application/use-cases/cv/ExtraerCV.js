const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ExtraerCV {
    constructor(iaService) {
        this.iaService = iaService;
    }

    async execute(fileBuffer, mimetype, originalname) {
        // 1. Extraer texto del archivo
        const texto = await this._extraerTexto(fileBuffer, mimetype, originalname);

        if (!texto || texto.trim().length < 50) {
            throw new Error('No se pudo extraer texto suficiente del archivo.');
        }

        // 2. Enviar a IA para estructurar los datos
        const promptSistema = `Eres un sistema de extracción de datos de CVs.
Analiza el texto del CV y extrae la información en formato JSON estructurado.

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional, sin markdown, sin explicaciones.

El JSON debe tener exactamente esta estructura:
{
  "titulo_profesional": <string con el título o puesto principal del candidato>,
  "resumen_profesional": <string con el resumen o perfil profesional, máximo 500 chars>,
  "anios_experiencia": <número entero>,
  "nivel_educacion": <string: "Secundaria" | "Técnico" | "Universitario" | "Licenciatura" | "Maestría" | "Doctorado" | otro>,
  "sector_profesional": <string con el sector o industria principal>,
  "habilidades": [
    {
      "nombre": <string>,
      "categoria": <string: "Técnica" | "Blanda" | "Idioma" | "Herramienta" | "Framework" | "Base de Datos" | otro>,
      "nivel": <"Básico" | "Intermedio" | "Avanzado" | "Experto">,
      "anios_experiencia": <número entero, 0 si no se especifica>
    }
  ]
}

Reglas:
- Extrae TODAS las habilidades técnicas, blandas e idiomas que encuentres
- Si no encuentras información para un campo, usa null o 0
- El nivel de habilidades infierelo del contexto si no está explícito
- Las habilidades deben ser items individuales, no grupos
- Para anios_experiencia del CV, suma los años de todas las experiencias laborales`;

        const mensajeUsuario = `Extrae los datos del siguiente CV:\n\n${texto.substring(0, 4000)}`;

        const respuestaRaw = await this.iaService.generarRespuesta(mensajeUsuario, promptSistema, {
            maxTokens: 2000,
            jsonMode: true
        });

        return this._parseRespuesta(respuestaRaw);
    }

    async _extraerTexto(buffer, mimetype, originalname) {
        const ext = (originalname || '').toLowerCase();

        if (mimetype === 'application/pdf' || ext.endsWith('.pdf')) {
            const data = await pdfParse(buffer);
            return data.text;
        }

        if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            ext.endsWith('.docx')
        ) {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        if (mimetype === 'application/msword' || ext.endsWith('.doc')) {
            try {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            } catch {
                throw new Error('Los archivos .doc pueden no ser compatibles. Convierte a .docx o PDF.');
            }
        }

        throw new Error('Formato no soportado. Usa PDF, DOCX o DOC.');
    }

    _parseRespuesta(raw) {
        try {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

            return {
                titulo_profesional: data.titulo_profesional || '',
                resumen_profesional: data.resumen_profesional || '',
                anios_experiencia: parseInt(data.anios_experiencia) || 0,
                nivel_educacion: data.nivel_educacion || '',
                sector_profesional: data.sector_profesional || '',
                habilidades: Array.isArray(data.habilidades)
                    ? data.habilidades.map(h => ({
                        nombre: h.nombre || '',
                        categoria: h.categoria || 'Técnica',
                        nivel: h.nivel || 'Intermedio',
                        anios_experiencia: parseInt(h.anios_experiencia) || 0
                    })).filter(h => h.nombre)
                    : []
            };
        } catch (e) {
            throw new Error(`Error procesando respuesta de IA: ${e.message}`);
        }
    }
}

module.exports = ExtraerCV;

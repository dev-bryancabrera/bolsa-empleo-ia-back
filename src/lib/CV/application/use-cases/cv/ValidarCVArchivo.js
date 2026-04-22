const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ValidarCVArchivo {
    constructor(iaService) {
        this.iaService = iaService;
    }

    async execute(fileBuffer, mimetype, originalname) {
        // 1. Extraer texto del archivo
        const texto = await this._extraerTexto(fileBuffer, mimetype, originalname);

        if (!texto || texto.trim().length < 50) {
            throw new Error('No se pudo extraer texto suficiente del archivo. Asegúrate de que el archivo no esté protegido o sea una imagen.');
        }

        // 2. Analizar con IA
        const promptSistema = `Eres un experto en recursos humanos y selección de personal con 15 años de experiencia evaluando CVs.
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
      "observacion": <string>
    }
  ],
  "sugerencias": [<string>, ...]
}

Criterios para el score:
- 90-100: excelente
- 70-89: bueno
- 50-69: mejorable
- 0-49: deficiente

Evalúa: Título/Objetivo, Resumen Profesional, Experiencia Laboral, Educación, Habilidades, Formato y Claridad, Palabras Clave ATS, Logros Cuantificables.
Genera entre 4 y 7 sugerencias concretas y accionables.`;

        const mensajeUsuario = `Analiza el siguiente CV extraído de un archivo:\n\n${texto.substring(0, 4000)}`;

        const respuestaRaw = await this.iaService.generarRespuesta(mensajeUsuario, promptSistema, {
            maxTokens: 1500,
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
            // Intentar con mammoth (soporta algunos .doc)
            try {
                const result = await mammoth.extractRawText({ buffer });
                return result.value;
            } catch {
                throw new Error('Los archivos .doc antiguos pueden no ser compatibles. Convierte a .docx o PDF.');
            }
        }

        throw new Error('Formato de archivo no soportado. Usa PDF, DOCX o DOC.');
    }

    _parseRespuesta(raw) {
        try {
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

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

module.exports = ValidarCVArchivo;

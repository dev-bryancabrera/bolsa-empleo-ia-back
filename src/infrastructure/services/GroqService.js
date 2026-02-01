const Groq = require('groq-sdk');

class GroqService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("❌ GROQ_API_KEY no configurada. Revisa tu archivo .env");
        }

        console.log("✅ Groq API Key detectada:", apiKey.substring(0, 10) + "...");

        this.groq = new Groq({ apiKey });

        // Modelos disponibles en Groq (todos gratuitos)
        this.modelo = "llama-3.3-70b-versatile"; // Recomendado: rápido y potente
        // Alternativas:
        // "llama-3.1-70b-versatile"
        // "mixtral-8x7b-32768"
        // "gemma2-9b-it"

        console.log("✅ Modelo Groq inicializado:", this.modelo);
    }

    async generarRespuesta(mensajeUsuario, contexto = {}) {
        try {
            const promptSistema = this.obtenerPromptSistema(contexto);

            console.log("📤 Enviando mensaje a Groq...");

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: promptSistema
                    },
                    {
                        role: "user",
                        content: mensajeUsuario
                    }
                ],
                model: this.modelo,
                temperature: 0.7,
                max_tokens: 2000,
            });

            const respuesta = completion.choices[0].message.content;

            console.log("✅ Respuesta recibida de Groq\n");

            return respuesta;
        } catch (error) {
            console.error("\n🔴 ERROR DETALLADO DE GROQ:");
            console.error("Mensaje:", error.message);

            if (error.error) {
                console.error("Detalles:", JSON.stringify(error.error, null, 2));
            }

            throw new Error(`Error en la comunicación con la IA: ${error.message}`);
        }
    }

    obtenerPromptSistema(contexto) {
        return `Eres "TalentIA", un consultor senior de Recursos Humanos especializado en el mercado laboral tecnológico. 

Tu objetivo es analizar el perfil del usuario y ayudarlo a destacar en procesos de selección.

DIRECTRICES DE COMPORTAMIENTO:
1. IDENTIDAD: Eres experto en detectar brechas de habilidades (skill gaps) y sugerir mejoras.
2. TONO: Profesional, motivador y directo. Evita introducciones innecesarias.
3. CONTEXTO ACTUAL: Estás interactuando con el usuario: ${contexto.nombreUsuario || 'Candidato'}.
4. CAPACIDADES:
   - Si el usuario menciona sus habilidades, compáralas con los estándares del sector (ej. si sabe React, sugiere aprender Testing o Next.js).
   - Si el usuario está creando su CV, ayúdalo a redactar logros usando el método STAR (Situación, Tarea, Acción, Resultado).
   - Si el usuario pregunta por empleos, enfócate en cómo su sector (${contexto.sector || 'general'}) está evolucionando con la IA.

RESTRICCIONES:
- No inventes certificaciones que el usuario no tenga.
- Tus respuestas no deben exceder los 3 párrafos a menos que sea una revisión detallada.
- Mantén un formato limpio usando puntos (bullets) para las listas de consejos.

${contexto.instrucciones_adicionales || ''}`;
    }

    async generarRutaAprendizaje(perfilPostulante) {
        const prompt = `
Analiza el siguiente perfil y genera una ruta de aprendizaje personalizada:

PERFIL DEL POSTULANTE:
- Nombre: ${perfilPostulante.nombre}
- Nivel actual: ${perfilPostulante.nivel}
- Habilidades actuales: ${perfilPostulante.habilidades.join(', ')}
- Objetivos profesionales: ${perfilPostulante.objetivos}
- Tiempo disponible: ${perfilPostulante.tiempoDisponible}

Genera una ruta de aprendizaje estructurada en 3 fases (corto, mediano y largo plazo) con:
1. Habilidades a desarrollar
2. Recursos recomendados
3. Tiempo estimado por fase
4. Proyectos prácticos sugeridos
`;

        return await this.generarRespuesta(prompt, {
            nombreUsuario: perfilPostulante.nombre,
            sector: perfilPostulante.sector || 'tecnología'
        });
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = GroqService;
const OpenAI = require('openai');

class GeminiService {
    constructor(apiKey, modelo = 'gemini-2.5-flash') {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) throw new Error('❌ GEMINI_API_KEY no configurada. Revisa tu archivo .env');
        this.client = new OpenAI({
            apiKey: key,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
        this.modelo = modelo;
        console.log('✅ Gemini Service inicializado con modelo:', this.modelo);
    }

    async generarRespuesta(mensajeUsuario, promptSistema, opciones = {}) {
        try {
            const { maxTokens = 8000, jsonMode = false } = opciones;

            const systemContent = jsonMode
                ? `${promptSistema}\n\nResponde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.`
                : promptSistema;

            const requestParams = {
                model: this.modelo,
                messages: [
                    { role: 'system', content: systemContent },
                    { role: 'user', content: mensajeUsuario }
                ],
                temperature: 0.6,
                max_tokens: maxTokens,
            };

            if (jsonMode) {
                requestParams.response_format = { type: 'json_object' };
            }

            const completion = await this.client.chat.completions.create(requestParams);
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR Gemini:', error.message);
            throw new Error(`Error en la comunicación con Gemini: ${error.message}`);
        }
    }

    async generarRespuestaConHistorial(messages, opciones = {}) {
        try {
            const { maxTokens = 4000 } = opciones;

            const completion = await this.client.chat.completions.create({
                model: this.modelo,
                messages,
                temperature: 0.7,
                max_tokens: maxTokens,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR Gemini (historial):', error.message);
            throw new Error(`Error en la comunicación con Gemini (historial): ${error.message}`);
        }
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = GeminiService;

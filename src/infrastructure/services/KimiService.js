const OpenAI = require('openai');

class KimiService {
    constructor(apiKey, modelo = 'moonshotai/kimi-k2.6') {
        const key = apiKey || process.env.NVIDIA_API_KEY;
        if (!key) throw new Error('❌ NVIDIA_API_KEY no configurada. Revisa tu archivo .env');
        this.client = new OpenAI({
            apiKey: key,
            baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        this.modelo = modelo;
        console.log('✅ Kimi Service inicializado con modelo:', this.modelo);
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
                top_p: 1.0,
            };

            const completion = await this.client.chat.completions.create(requestParams);
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR Kimi:', error.message);
            throw new Error(`Error en la comunicación con Kimi: ${error.message}`);
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
                top_p: 1.0,
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR Kimi (historial):', error.message);
            throw new Error(`Error en la comunicación con Kimi (historial): ${error.message}`);
        }
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = KimiService;

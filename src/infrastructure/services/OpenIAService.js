const OpenAI = require('openai');

class OpenAIService {
    constructor(apiKey, modelo = 'gpt-4o-mini') {
        if (!apiKey) throw new Error('OpenAI API key requerida');
        this.client = new OpenAI({ apiKey });
        this.modelo = modelo;
        console.log('✅ OpenAI Service inicializado con modelo:', this.modelo);
    }

    async generarRespuesta(mensajeUsuario, promptSistema, opciones = {}) {
        try {
            const { maxTokens = 2000, jsonMode = false } = opciones;

            const requestParams = {
                model: this.modelo,
                messages: [
                    { role: 'system', content: promptSistema },
                    { role: 'user', content: mensajeUsuario }
                ],
                temperature: 0.7,
                max_tokens: maxTokens
            };

            if (jsonMode) {
                requestParams.response_format = { type: 'json_object' };
            }

            const completion = await this.client.chat.completions.create(requestParams);
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR OpenAI:', error.message);
            throw new Error(`Error con OpenAI: ${error.message}`);
        }
    }

    async generarRespuestaConHistorial(messages, opciones = {}) {
        try {
            const { maxTokens = 2000 } = opciones;

            const completion = await this.client.chat.completions.create({
                model: this.modelo,
                messages,
                temperature: 0.7,
                max_tokens: maxTokens
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR OpenAI (historial):', error.message);
            throw new Error(`Error con OpenAI (historial): ${error.message}`);
        }
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = OpenAIService;

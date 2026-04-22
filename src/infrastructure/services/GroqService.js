const Groq = require('groq-sdk');

class GroqService {
    constructor(apiKey, modelo = 'llama-3.3-70b-versatile') {
        const key = apiKey || process.env.GROQ_API_KEY;
        if (!key) throw new Error('❌ GROQ_API_KEY no configurada. Revisa tu archivo .env');
        this.groq = new Groq({ apiKey: key });
        this.modelo = modelo;
        console.log('✅ Groq Service inicializado con modelo:', this.modelo);
    }

    async generarRespuesta(mensajeUsuario, promptSistema, opciones = {}) {
        try {
            const { maxTokens = 2000, jsonMode = false } = opciones;

            const requestParams = {
                messages: [
                    { role: 'system', content: promptSistema },
                    { role: 'user', content: mensajeUsuario }
                ],
                model: this.modelo,
                temperature: 0.7,
                max_tokens: maxTokens
            };

            if (jsonMode) {
                requestParams.response_format = { type: 'json_object' };
            }

            const completion = await this.groq.chat.completions.create(requestParams);
            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR GROQ:', error.message);
            if (error.error) console.error('Detalles:', JSON.stringify(error.error, null, 2));
            throw new Error(`Error en la comunicación con Groq: ${error.message}`);
        }
    }

    async generarRespuestaConHistorial(messages, opciones = {}) {
        try {
            const { maxTokens = 2000 } = opciones;

            const completion = await this.groq.chat.completions.create({
                messages,
                model: this.modelo,
                temperature: 0.7,
                max_tokens: maxTokens
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('🔴 ERROR GROQ (historial):', error.message);
            if (error.error) console.error('Detalles:', JSON.stringify(error.error, null, 2));
            throw new Error(`Error en la comunicación con Groq (historial): ${error.message}`);
        }
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = GroqService;

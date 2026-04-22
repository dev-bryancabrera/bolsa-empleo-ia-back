const Anthropic = require('@anthropic-ai/sdk');

class AnthropicService {
    constructor(apiKey, modelo = 'claude-sonnet-4-6') {
        if (!apiKey) throw new Error('Anthropic API key requerida');
        this.client = new Anthropic({ apiKey });
        this.modelo = modelo;
        console.log('✅ Anthropic Service inicializado con modelo:', this.modelo);
    }

    async generarRespuesta(mensajeUsuario, promptSistema, opciones = {}) {
        try {
            const { maxTokens = 2000, jsonMode = false } = opciones;

            const systemContent = jsonMode
                ? `${promptSistema}\n\nResponde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.`
                : promptSistema;

            const response = await this.client.messages.create({
                model: this.modelo,
                max_tokens: maxTokens,
                system: systemContent,
                messages: [{ role: 'user', content: mensajeUsuario }]
            });

            return response.content[0].text;
        } catch (error) {
            console.error('🔴 ERROR Anthropic:', error.message);
            throw new Error(`Error con Anthropic: ${error.message}`);
        }
    }

    async generarRespuestaConHistorial(messages, opciones = {}) {
        try {
            const { maxTokens = 2000 } = opciones;

            const systemMsg = messages.find(m => m.role === 'system');
            const historial = messages.filter(m => m.role !== 'system');

            const response = await this.client.messages.create({
                model: this.modelo,
                max_tokens: maxTokens,
                system: systemMsg?.content || '',
                messages: historial
            });

            return response.content[0].text;
        } catch (error) {
            console.error('🔴 ERROR Anthropic (historial):', error.message);
            throw new Error(`Error con Anthropic (historial): ${error.message}`);
        }
    }

    obtenerModeloActual() {
        return this.modelo;
    }
}

module.exports = AnthropicService;

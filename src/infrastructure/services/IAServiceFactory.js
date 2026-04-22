const GroqService = require('./GroqService');
const OpenAIService = require('./OpenIAService');
const AnthropicService = require('./AnthropicService');

const MODELOS = {
    groq: [
        { id: 'llama-3.3-70b-versatile', nombre: 'Llama 3.3 70B (Recomendado)', gratuito: true },
        { id: 'llama-3.1-8b-instant', nombre: 'Llama 3.1 8B (Rápido)', gratuito: true },
        { id: 'mixtral-8x7b-32768', nombre: 'Mixtral 8x7B', gratuito: true },
        { id: 'gemma2-9b-it', nombre: 'Gemma 2 9B', gratuito: true }
    ],
    openai: [
        { id: 'gpt-4o', nombre: 'GPT-4o', gratuito: false },
        { id: 'gpt-4o-mini', nombre: 'GPT-4o Mini (Económico)', gratuito: false },
        { id: 'gpt-4-turbo', nombre: 'GPT-4 Turbo', gratuito: false }
    ],
    anthropic: [
        { id: 'claude-opus-4-7', nombre: 'Claude Opus 4.7 (Máxima capacidad)', gratuito: false },
        { id: 'claude-sonnet-4-6', nombre: 'Claude Sonnet 4.6 (Recomendado)', gratuito: false },
        { id: 'claude-haiku-4-5-20251001', nombre: 'Claude Haiku 4.5 (Rápido)', gratuito: false }
    ]
};

class IAServiceFactory {
    static crearServicio(proveedor, modelo, apiKey = null) {
        switch (proveedor) {
            case 'openai':
                return new OpenAIService(apiKey || process.env.OPENAI_API_KEY, modelo);
            case 'anthropic':
                return new AnthropicService(apiKey || process.env.ANTHROPIC_API_KEY, modelo);
            case 'groq':
            default:
                return new GroqService(apiKey || process.env.GROQ_API_KEY, modelo);
        }
    }

    static async crearServicioParaPersona(personaId, configuracionRepository) {
        try {
            const config = await configuracionRepository.obtenerPorPersonaId(personaId);
            if (config) {
                return IAServiceFactory.crearServicio(config.proveedor, config.modelo, config.api_key);
            }
        } catch (_) { /* usa servicio por defecto */ }
        return new GroqService(process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile');
    }

    static async validarApiKey(proveedor, modelo, apiKey) {
        try {
            const servicio = IAServiceFactory.crearServicio(proveedor, modelo, apiKey);
            const respuesta = await servicio.generarRespuesta(
                'Responde únicamente con: ok',
                'Eres un asistente. Responde solo "ok".',
                { maxTokens: 10 }
            );
            return { valida: true, respuesta };
        } catch (error) {
            return { valida: false, error: error.message };
        }
    }

    static obtenerProveedores() {
        return [
            { id: 'groq', nombre: 'Groq (Gratuito)', gratuito: true, descripcion: 'Modelos LLaMA y Mixtral, sin costo' },
            { id: 'openai', nombre: 'OpenAI (De pago)', gratuito: false, descripcion: 'GPT-4o y modelos avanzados de OpenAI' },
            { id: 'anthropic', nombre: 'Anthropic Claude (De pago)', gratuito: false, descripcion: 'Claude Opus, Sonnet y Haiku' }
        ];
    }

    static obtenerModelos(proveedor) {
        return MODELOS[proveedor] || [];
    }
}

module.exports = IAServiceFactory;

const OpenAI = require('openai');

class OpenAIService {
    constructor() {
        this.client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    }

    async generarRespuesta(mensaje, historial = [], contexto = {}) {
        try {
            const mensajesFormateados = [
                {
                    role: 'system',
                    content: this.obtenerPromptSistema(contexto)
                },
                ...historial,
                {
                    role: 'user',
                    content: mensaje
                }
            ];

            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: mensajesFormateados,
                temperature: 0.7,
                max_tokens: 1000,
            });

            return {
                content: completion.choices[0].message.content,
                model: completion.model,
                usage: completion.usage
            };
        } catch (error) {
            console.error('Error al llamar a OpenAI:', error);
            throw new Error('Error al generar respuesta del chatbot');
        }
    }

    obtenerPromptSistema(contexto) {
        return `Eres un asistente virtual experto en recursos humanos y gestión de CVs. 
        Tu función es ayudar a los usuarios a mejorar sus perfiles profesionales mediante rutas
        de aprendizaje, crear CVs efectivos y brindar consejos sobre desarrollo de carrera.
        
        Responde de manera profesional, amigable y concisa.
        ${contexto.instrucciones_adicionales || ''}`;
    }
}

module.exports = OpenAIService;
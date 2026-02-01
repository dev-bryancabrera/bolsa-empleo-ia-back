const Conversacion = require('../../domain/Conversacion');

class EnviarMensaje {
    constructor(conversacionRepository, personaRepository, openAIService) {
        this.conversacionRepository = conversacionRepository;
        this.personaRepository = personaRepository;
        this.openAIService = openAIService;
    }

    async execute(personaId, mensaje, contexto = {}) {
        // Verificar que la persona existe
        const personaExiste = await this.personaRepository.obtenerPorId(personaId);
        if (!personaExiste) {
            throw new Error('La persona no existe');
        }

        // Obtener historial de conversaciones recientes para contexto
        const historial = await this.conversacionRepository.obtenerHistorialPorPersona(
            personaId,
            10 // últimas 10 conversaciones
        );

        // Preparar contexto para OpenAI
        const mensajesContexto = historial.map(conv => ({
            role: 'user',
            content: conv.mensaje
        }));

        // Llamar a OpenAI
        const respuesta = await this.openAIService.generarRespuesta(
            mensaje,
            mensajesContexto,
            contexto
        );

        // Guardar la conversación
        const conversacion = new Conversacion({
            persona_id: personaId,
            mensaje: mensaje,
            respuesta: respuesta.content,
            tipo: 'chatbot',
            metadata: {
                modelo: respuesta.model,
                tokens_usados: respuesta.usage,
                timestamp: new Date(),
                ...contexto
            }
        });

        return this.conversacionRepository.crear(conversacion);
    }
}

module.exports = EnviarMensaje;
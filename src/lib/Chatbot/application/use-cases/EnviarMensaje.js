class EnviarMensaje {
    constructor(conversacionRepository, iaService) {
        this.conversacionRepository = conversacionRepository;
        this.iaService = iaService;
    }

    async execute(personaId, mensajeUsuario) {
        // 1. (Opcional) Podrías buscar historial previo aquí con this.conversacionRepository

        // 2. Llamar a la IA
        const respuestaIA = await this.iaService.generarRespuesta(mensajeUsuario);

        // 3. Crear el objeto de dominio para guardar
        const nuevaConversacion = {
            persona_id: personaId,
            mensaje: mensajeUsuario,
            respuesta: respuestaIA,
            tipo: 'chat_asistente',
            metadata: JSON.stringify({ modelo: process.env.GEMINI_MODEL, fecha: new Date() })
        };

        // 4. Guardar en MySQL
        return await this.conversacionRepository.save(nuevaConversacion);
    }
}

module.exports = EnviarMensaje;
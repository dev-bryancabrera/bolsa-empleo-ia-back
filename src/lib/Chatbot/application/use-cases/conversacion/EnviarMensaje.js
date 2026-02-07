class EnviarMensaje {
    constructor(conversacionRepository, cvRepository, iaService) {
        this.conversacionRepository = conversacionRepository;
        this.cvRepository = cvRepository;
        this.iaService = iaService;
    }

    async execute(personaId, chatId, mensajeUsuario) {
        // 1. Guardar mensaje del USUARIO
        const mensajeUsuarioObj = {
            persona_id: personaId,
            chat_id: chatId,
            mensaje: mensajeUsuario,
            respuesta: null,
            tipo: 'usuario',
            respuesta_chat: 0, // ✅ 0 = mensaje del usuario
            json: 0,
            metadata: JSON.stringify({ fecha: new Date() })
        };

        await this.conversacionRepository.save(mensajeUsuarioObj);

        // 2. Obtener CV para contexto
        let cvCompletoConHabilidades = null;
        const cvCompleto = await this.cvRepository.obtenerPorPersonaId(personaId);

        if (cvCompleto) {
            const cvHabilidades = await this.cvRepository.obtenerHabilidades(cvCompleto.id);
            cvCompletoConHabilidades = {
                ...cvCompleto,
                habilidades: cvHabilidades
            };
        }

        // 3. Llamar a la IA
        const respuestaIA = await this.iaService.generarRespuesta(
            mensajeUsuario,
            cvCompletoConHabilidades,
            { personaId }
        );

        // 4. Detectar si la respuesta es JSON
        let esJSON = 0;
        try {
            const jsonMatch = respuestaIA.match(/\{[\s\S]*"tipo"\s*:\s*"ruta_aprendizaje"[\s\S]*\}/);
            if (jsonMatch) {
                JSON.parse(jsonMatch[0]); // Validar que sea JSON válido
                esJSON = 1;
            }
        } catch (e) {
            esJSON = 0;
        }

        // 5. Guardar respuesta de la IA
        const respuestaIAObj = {
            persona_id: personaId,
            chat_id: chatId,
            mensaje: mensajeUsuario, // Referencia al mensaje original
            respuesta: respuestaIA,
            tipo: 'asistente',
            respuesta_chat: 1, // ✅ 1 = respuesta de la IA
            json: esJSON,      // ✅ 1 si es JSON, 0 si es texto
            metadata: JSON.stringify({
                modelo: "llama-3.3-70b-versatile",
                fecha: new Date()
            })
        };

        return await this.conversacionRepository.save(respuestaIAObj);
    }
}

module.exports = EnviarMensaje;
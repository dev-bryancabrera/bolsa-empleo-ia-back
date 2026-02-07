class ConversacionController {
    constructor({
        enviarMensaje,
        listarConversacion,
        listarConversacionPorChat,
        obtenerConversacion,
        eliminarConversacion,
        limpiarHistorialConversacion,
        actualizarConversacion
    }) {
        this._enviarMensaje = enviarMensaje;
        this._listarConversacion = listarConversacion;
        this._listarConversacionPorChat = listarConversacionPorChat;
        this._obtenerConversacion = obtenerConversacion;
        this._eliminarConversacion = eliminarConversacion;
        this._limpiarHistorialConversacion = limpiarHistorialConversacion;
        this._actualizarConversacion = actualizarConversacion;
    }

    // 1. Enviar un nuevo mensaje y obtener respuesta de la IA
    enviarMensaje = async (req, res) => {
        try {
            const { mensaje, chat_id } = req.body;
            const personaId = req.usuario.persona?.id || req.body.persona_id;

            if (!mensaje) {
                return res.status(400).json({ error: 'El mensaje es requerido' });
            }

            const resultado = await this._enviarMensaje.execute(personaId, chat_id, mensaje);
            res.status(201).json(resultado);
        } catch (error) {
            console.error('Error en enviarMensaje:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 2. Listar todas las conversaciones del usuario
    listar = async (req, res) => {
        try {
            const personaId = req.params.idPersona;
            const conversaciones = await this._listarConversacion.execute(personaId);
            res.json(conversaciones);
        } catch (error) {
            console.error('Error en listar conversaciones:', error);
            res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
        }
    }

    listarPorChat = async (req, res) => {
        try {
            const { idChat } = req.params;

            if (!idChat) {
                return res.status(400).json({ error: 'El ID del chat es requerido' });
            }

            const conversaciones = await this._listarConversacionPorChat.execute(idChat);
            res.status(200).json(conversaciones);
        } catch (error) {
            console.error('Error en listarPorChat:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 3. Obtener el detalle de una conversación específica
    obtener = async (req, res) => {
        try {
            const { id } = req.params;
            const conversacion = await this._obtenerConversacion.execute(id);

            if (!conversacion) {
                return res.status(404).json({ error: 'Conversación no encontrada' });
            }

            res.json(conversacion);
        } catch (error) {
            console.error('Error en obtener conversación:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 4. Eliminar o limpiar historial
    eliminar = async (req, res) => {
        try {
            const { id } = req.params;
            await this._eliminarConversacion.execute(id);
            res.json({ mensaje: 'Conversación eliminada exitosamente' });
        } catch (error) {
            console.error('Error en eliminar conversación:', error);
            res.status(500).json({ error: 'No se pudo eliminar la conversación' });
        }
    }
}

module.exports = ConversacionController;
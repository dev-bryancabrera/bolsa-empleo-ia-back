class ConversacionController {
    constructor({ enviarMensaje, listarConversacion, obtenerConversacion, eliminarConversacion }) {
        this._enviarMensaje = enviarMensaje;
        this._listarConversacion = listarConversacion;
        this._obtenerConversacion = obtenerConversacion;
        this._eliminarConversacion = eliminarConversacion;
    }

    // 1. Enviar un nuevo mensaje y obtener respuesta de la IA
    enviarMensaje = async (req, res) => {
        try {
            const { mensaje } = req.body;
            // Obtenemos el ID de la persona desde el usuario autenticado (inyectado por el middleware auth)
            const personaId = req.usuario.persona?.id || req.body.persona_id;

            if (!mensaje) {
                return res.status(400).json({ error: 'El mensaje es requerido' });
            }

            const resultado = await this._enviarMensaje.execute(personaId, mensaje);
            res.status(201).json(resultado);
        } catch (error) {
            console.error('Error en enviarMensaje:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // 2. Listar todas las conversaciones del usuario
    listar = async (req, res) => {
        try {
            const personaId = req.usuario.persona?.id;
            const conversaciones = await this._listarConversacion.execute(personaId);
            res.json(conversaciones);
        } catch (error) {
            console.error('Error en listar conversaciones:', error);
            res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
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
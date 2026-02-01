class ConversacionController {
    constructor({ enviarMensaje, listarConversacion, obtenerConversacion, eliminarConversacion }) {
        this._enviarMensaje = enviarMensaje;
        this._listarConversacion = listarConversacion;
        this._obtenerConversacion = obtenerConversacion;
        this._eliminarConversacion = eliminarConversacion;
    }

    enviarMensaje = async (req, res) => {
        try {
            const { persona_id, mensaje } = req.body;
            // Llamamos al execute del caso de uso
            const resultado = await this._enviarMensaje.execute(persona_id, mensaje);
            res.status(201).json(resultado);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // ... los demás métodos listar, obtener, eliminar
}

module.exports = ConversacionController;
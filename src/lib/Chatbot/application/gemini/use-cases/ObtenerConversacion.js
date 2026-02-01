class ObtenerConversacion {
    constructor(conversacionRepository) {
        this.repository = conversacionRepository;
    }

    async execute(id) {
        const conversacion = await this.repository.findById(id);
        if (!conversacion) throw new Error("Conversación no encontrada");
        return conversacion;
    }
}

module.exports = ObtenerConversacion;
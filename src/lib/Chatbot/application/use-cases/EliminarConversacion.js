class EliminarConversacion {
    constructor(conversacionRepository) {
        this.conversacionRepository = conversacionRepository;
    }

    async execute(id) {
        const conversacionExiste = await this.conversacionRepository.obtenerPorId(id);
        if (!conversacionExiste) {
            throw new Error('Conversación no encontrada');
        }

        return this.conversacionRepository.eliminar(id);
    }
}

module.exports = EliminarConversacion;
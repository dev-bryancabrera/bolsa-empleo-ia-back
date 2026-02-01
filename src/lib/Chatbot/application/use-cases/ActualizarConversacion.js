class ActualizarConversacion {
    constructor(conversacionRepository) {
        this.conversacionRepository = conversacionRepository;
    }

    async execute(id, dto) {
        const conversacionExiste = await this.conversacionRepository.obtenerPorId(id);
        if (!conversacionExiste) {
            throw new Error('Conversación no encontrada');
        }

        // Agregar fecha de actualización
        dto.update_at = new Date();

        return this.conversacionRepository.actualizar(id, dto);
    }
}

module.exports = ActualizarConversacion;
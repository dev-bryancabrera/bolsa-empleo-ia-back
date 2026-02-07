class LimpiarHistorialConversacion {
    constructor(conversacionRepository) {
        this.conversacionRepository = conversacionRepository;
    }

    async execute(personaId) {
        return this.conversacionRepository.eliminarPorPersona(personaId);
    }
}

module.exports = LimpiarHistorialConversacion;
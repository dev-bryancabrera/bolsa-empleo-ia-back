class ObtenerConversacion {
    constructor(conversacionRepository) {
        this.conversacionRepository = conversacionRepository;
    }

    async execute(personaId, limite = 50) {
        return this.conversacionRepository.obtenerHistorialPorPersona(personaId, limite);
    }
}

module.exports = ObtenerConversacion;
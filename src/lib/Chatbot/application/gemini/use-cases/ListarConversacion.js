class ListarConversacion {
    constructor(conversacionRepository) {
        this.repository = conversacionRepository;
    }

    async execute(personaId) {
        if (!personaId) throw new Error("Se requiere el ID de la persona");
        return await this.repository.findByPersona(personaId);
    }
}

module.exports = ListarConversacion;
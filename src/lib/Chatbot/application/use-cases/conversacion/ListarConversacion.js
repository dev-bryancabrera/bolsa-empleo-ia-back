class ListarConversacion {
    constructor(conversacionRepository) {
        this.repository = conversacionRepository;
    }

    async execute(chatId) {
        if (!chatId) throw new Error("Se requiere el ID de la persona");
        return await this.repository.findByPersona(chatId);
    }
}

module.exports = ListarConversacion;
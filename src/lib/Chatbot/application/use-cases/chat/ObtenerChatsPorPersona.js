class ObtenerChatsPorPersona {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(personaId) {
        return await this.chatRepository.obtenerPorPersona(personaId);
    }
}

module.exports = ObtenerChatsPorPersona;
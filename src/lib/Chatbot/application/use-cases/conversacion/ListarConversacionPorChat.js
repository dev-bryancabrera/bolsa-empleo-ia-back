class ListarConversacionPorChat {
    constructor(conversacionRepository) {
        this.conversacionRepository = conversacionRepository;
    }

    async execute(chatId) {
        return await this.conversacionRepository.listarPorChat(chatId);
    }
}

module.exports = ListarConversacionPorChat;
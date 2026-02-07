class ObtenerChat {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(id) {
        const chat = await this.chatRepository.obtenerPorId(id);
        if (!chat) {
            throw new Error('Chat no encontrado');
        }
        return chat;
    }
}

module.exports = ObtenerChat;
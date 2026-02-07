class EliminarChat {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(id) {
        const chatExistente = await this.chatRepository.obtenerPorId(id);
        if (!chatExistente) {
            throw new Error('Chat no encontrado');
        }

        const eliminado = await this.chatRepository.eliminar(id);
        if (!eliminado) {
            throw new Error('No se pudo eliminar el chat');
        }

        return true;
    }
}

module.exports = EliminarChat;
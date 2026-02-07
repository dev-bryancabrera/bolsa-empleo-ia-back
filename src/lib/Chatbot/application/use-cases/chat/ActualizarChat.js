const Chat = require('../../../domain/chat/Chat.js');

class ActualizarChat {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(id, dto) {
        const chatExistente = await this.chatRepository.obtenerPorId(id);
        if (!chatExistente) {
            throw new Error('Chat no encontrado');
        }

        const chatActualizado = new Chat({
            ...chatExistente,
            ...dto,
        });

        return await this.chatRepository.actualizar(id, chatActualizado);
    }
}

module.exports = ActualizarChat;
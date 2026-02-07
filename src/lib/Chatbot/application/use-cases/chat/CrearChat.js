const Chat = require('../../../domain/chat/Chat.js');

class CrearChat {
    constructor(chatRepository) {
        this.chatRepository = chatRepository;
    }

    async execute(dto) {
        const chat = new Chat({
            persona_id: dto.persona_id,
            titulo: dto.titulo,
            estado: dto.estado || 'activo',
            configuracion: dto.configuracion,
        });

        return await this.chatRepository.crear(chat);
    }
}

module.exports = CrearChat;
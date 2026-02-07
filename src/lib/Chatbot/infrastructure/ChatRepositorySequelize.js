const ChatModel = require('../../../infrastructure/models/ChatModel.js');
const Chat = require('../domain/chat/Chat.js');
const ChatRepository = require('../domain/chat/ChatRepository.js');

class ChatRepositorySequelize extends ChatRepository {
    async crear(chat) {
        const chatCreado = await ChatModel.create({
            persona_id: chat.persona_id,
            titulo: chat.titulo,
            estado: chat.estado || 'activo',
            configuracion: chat.configuracion,
            created_at: new Date(),
        });
        return this._toEntity(chatCreado);
    }

    async listar() {
        const chats = await ChatModel.findAll({
            order: [['created_at', 'DESC']],
        });
        return chats.map(chat => this._toEntity(chat));
    }

    async obtenerPorId(id) {
        const chat = await ChatModel.findByPk(id);
        if (!chat) return null;
        return this._toEntity(chat);
    }

    async obtenerPorPersona(personaId) {
        const chats = await ChatModel.findAll({
            where: { persona_id: personaId },
            order: [['created_at', 'DESC']],
        });
        return chats.map(chat => this._toEntity(chat));
    }

    async actualizar(id, datos) {
        const [updatedRowsCount] = await ChatModel.update(
            {
                ...datos,
                updated_at: new Date(),
            },
            {
                where: { id },
            }
        );

        if (updatedRowsCount === 0) return null;

        const chatActualizado = await ChatModel.findByPk(id);
        return this._toEntity(chatActualizado);
    }

    async eliminar(id) {
        const deletedRowsCount = await ChatModel.destroy({
            where: { id },
        });
        return deletedRowsCount > 0;
    }

    _toEntity(chatModel) {
        return new Chat({
            id: chatModel.id,
            persona_id: chatModel.persona_id,
            titulo: chatModel.titulo,
            estado: chatModel.estado,
            configuracion: chatModel.configuracion,
            created_at: chatModel.created_at,
            updated_at: chatModel.updated_at,
        });
    }
}

module.exports = ChatRepositorySequelize;
const { ChatModel } = require('../../../infrastructure/models');
const ConversacionModel = require('../../../infrastructure/models/ConversacionModel');

class ConversacionRepositorySequelize {
    /**
     * Guarda una nueva conversación o mensaje en la base de datos
     */
    async save(datos) {
        try {
            // Sequelize creará la fila en la tabla 'conversaciones'
            return await ConversacionModel.create(datos);
        } catch (error) {
            console.error('❌ Error en ConversacionRepository (save):', error);
            throw new Error('Error al guardar la conversación en la base de datos');
        }
    }

    /**
     * Lista el historial por persona
     */
    async findByChat(chatId) {
        try {
            return await ChatModel.findAll({
                where: { chat_id: chatId },
                order: [['created_at', 'ASC']]
            });
        } catch (error) {
            throw new Error('Error al obtener el historial');
        }
    }

    /**
     * Obtener una sola por ID
     */
    async findById(id) {
        return await ConversacionModel.findByPk(id);
    }

    /**
     * Eliminar (opcional)
     */
    async delete(id) {
        const conversacion = await ConversacionModel.findByPk(id);
        if (conversacion) {
            await conversacion.destroy();
            return true;
        }
        return false;
    }

    async listarPorChat(chatId) {
        const conversaciones = await ConversacionModel.findAll({
            where: { chat_id: chatId },
            order: [['created_at', 'ASC']] // Ordenar por fecha de creación
        });

        return conversaciones.map(conv => conv.toJSON());
    }
}

module.exports = ConversacionRepositorySequelize;
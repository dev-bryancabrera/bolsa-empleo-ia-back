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
    async findByPersona(personaId) {
        try {
            return await ConversacionModel.findAll({
                where: { persona_id: personaId },
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
}

module.exports = ConversacionRepositorySequelize;
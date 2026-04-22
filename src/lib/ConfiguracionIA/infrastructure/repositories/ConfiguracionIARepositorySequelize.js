const { ConfiguracionIAModel } = require('../../../../infrastructure/models');

class ConfiguracionIARepositorySequelize {
    async obtenerPorPersonaId(personaId) {
        return await ConfiguracionIAModel.findOne({ where: { persona_id: personaId } });
    }

    async guardar(personaId, proveedor, modelo, apiKey = null) {
        const existente = await ConfiguracionIAModel.findOne({ where: { persona_id: personaId } });
        if (existente) {
            return await existente.update({ proveedor, modelo, api_key: apiKey });
        }
        return await ConfiguracionIAModel.create({ persona_id: personaId, proveedor, modelo, api_key: apiKey });
    }

    async eliminar(personaId) {
        return await ConfiguracionIAModel.destroy({ where: { persona_id: personaId } });
    }
}

module.exports = ConfiguracionIARepositorySequelize;

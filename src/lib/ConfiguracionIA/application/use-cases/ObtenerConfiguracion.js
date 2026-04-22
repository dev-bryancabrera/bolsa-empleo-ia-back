const IAServiceFactory = require('../../../../infrastructure/services/IAServiceFactory');

class ObtenerConfiguracion {
    constructor(configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    async execute(personaId) {
        const config = await this.configuracionRepository.obtenerPorPersonaId(personaId);

        const proveedores = IAServiceFactory.obtenerProveedores();

        if (!config) {
            return {
                proveedor: 'groq',
                modelo: 'llama-3.3-70b-versatile',
                tiene_api_key: false,
                proveedores,
                modelos: IAServiceFactory.obtenerModelos('groq')
            };
        }

        return {
            proveedor: config.proveedor,
            modelo: config.modelo,
            tiene_api_key: !!config.api_key,
            proveedores,
            modelos: IAServiceFactory.obtenerModelos(config.proveedor)
        };
    }
}

module.exports = ObtenerConfiguracion;

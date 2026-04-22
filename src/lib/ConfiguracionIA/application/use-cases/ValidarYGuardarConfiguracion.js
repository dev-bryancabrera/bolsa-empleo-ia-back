const IAServiceFactory = require('../../../../infrastructure/services/IAServiceFactory');

class ValidarYGuardarConfiguracion {
    constructor(configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    async execute(personaId, proveedor, modelo, apiKey = null) {
        // Groq usa la key del sistema, no necesita validación de key propia
        if (proveedor !== 'groq') {
            if (!apiKey) {
                throw new Error(`Se requiere una API key para el proveedor ${proveedor}`);
            }

            const { valida, error } = await IAServiceFactory.validarApiKey(proveedor, modelo, apiKey);
            if (!valida) {
                const errLower = (error || '').toLowerCase();
                const esKeyInvalida = errLower.includes('api_key') || errLower.includes('apikey')
                    || errLower.includes('authentication') || errLower.includes('unauthorized')
                    || errLower.includes('invalid') || errLower.includes('incorrect')
                    || errLower.includes('401') || errLower.includes('403');
                const esSinCreditos = errLower.includes('quota') || errLower.includes('credit')
                    || errLower.includes('billing') || errLower.includes('429');
                const nombreProveedor = proveedor === 'openai' ? 'OpenAI' : 'Anthropic';
                if (esSinCreditos) {
                    throw new Error(`Tu cuenta de ${nombreProveedor} no tiene créditos disponibles. Recarga tu saldo e intenta de nuevo.`);
                }
                if (esKeyInvalida) {
                    throw new Error(`La API key de ${nombreProveedor} es inválida. Verifica que la hayas copiado correctamente.`);
                }
                throw new Error(`No se pudo conectar con ${nombreProveedor}. Verifica tu API key e intenta de nuevo.`);
            }
        }

        const config = await this.configuracionRepository.guardar(
            personaId,
            proveedor,
            modelo,
            proveedor === 'groq' ? null : apiKey
        );

        return {
            success: true,
            proveedor,
            modelo,
            tiene_api_key: proveedor !== 'groq'
        };
    }
}

module.exports = ValidarYGuardarConfiguracion;

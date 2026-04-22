const IAServiceFactory = require('../../../../../infrastructure/services/IAServiceFactory');

class ConfiguracionIAController {
    constructor({ obtenerConfiguracion, validarYGuardar }) {
        this.obtenerConfiguracion = obtenerConfiguracion;
        this.validarYGuardar = validarYGuardar;
    }

    async obtener(req, res) {
        try {
            const personaId = parseInt(req.params.persona_id);
            const config = await this.obtenerConfiguracion.execute(personaId);
            res.json({ success: true, data: config });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async guardar(req, res) {
        try {
            const personaId = parseInt(req.params.persona_id);
            const { proveedor, modelo, api_key } = req.body;

            if (!proveedor || !modelo) {
                return res.status(400).json({ success: false, message: 'Proveedor y modelo son requeridos' });
            }

            const resultado = await this.validarYGuardar.execute(personaId, proveedor, modelo, api_key);
            res.json(resultado);
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async obtenerProveedores(req, res) {
        try {
            const { proveedor } = req.query;
            res.json({
                success: true,
                data: {
                    proveedores: IAServiceFactory.obtenerProveedores(),
                    modelos: proveedor ? IAServiceFactory.obtenerModelos(proveedor) : []
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ConfiguracionIAController;

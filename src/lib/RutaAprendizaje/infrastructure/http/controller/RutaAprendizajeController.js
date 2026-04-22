class RutaAprendizajeController {
    constructor({ guardarRuta, obtenerRutasPorPersona, actualizarProgreso, actualizarEstado, eliminarRuta }) {
        this.guardarRuta = guardarRuta;
        this.obtenerRutasPorPersona = obtenerRutasPorPersona;
        this.actualizarProgreso = actualizarProgreso;
        this.actualizarEstado = actualizarEstado;
        this.eliminarRuta = eliminarRuta;

        this.guardar = this.guardar.bind(this);
        this.listarPorPersona = this.listarPorPersona.bind(this);
        this.patchProgreso = this.patchProgreso.bind(this);
        this.patchEstado = this.patchEstado.bind(this);
        this.eliminar = this.eliminar.bind(this);
    }

    async guardar(req, res) {
        try {
            const { persona_id, chat_id, json_ruta } = req.body;
            if (!persona_id || !json_ruta) {
                return res.status(400).json({ error: 'persona_id y json_ruta son requeridos' });
            }
            const ruta = await this.guardarRuta.execute({ persona_id, chat_id, json_ruta });
            return res.status(201).json(ruta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async listarPorPersona(req, res) {
        try {
            const { personaId } = req.params;
            const rutas = await this.obtenerRutasPorPersona.execute(parseInt(personaId));
            return res.json(rutas);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async patchProgreso(req, res) {
        try {
            const { id } = req.params;
            const { progreso_fases } = req.body;
            const ruta = await this.actualizarProgreso.execute(parseInt(id), progreso_fases);
            return res.json(ruta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async patchEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const ruta = await this.actualizarEstado.execute(parseInt(id), estado);
            return res.json(ruta);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            await this.eliminarRuta.execute(parseInt(id));
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RutaAprendizajeController;

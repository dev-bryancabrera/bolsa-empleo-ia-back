class HabilidadesController {
    constructor({
        crearHabilidad,
        listarHabilidades,
        obtenerHabilidad,
        obtenerHabilidadesPorCV,
        actualizarHabilidad,
        eliminarHabilidad,
    }) {
        this.crearHabilidad = crearHabilidad;
        this.listarHabilidades = listarHabilidades;
        this.obtenerHabilidad = obtenerHabilidad;
        this.obtenerHabilidadesPorCV = obtenerHabilidadesPorCV;
        this.actualizarHabilidad = actualizarHabilidad;
        this.eliminarHabilidad = eliminarHabilidad;
    }

    crear = async (req, res, next) => {
        try {
            const habilidad = await this.crearHabilidad.execute(req.body);
            res.status(201).json(habilidad);
        } catch (error) {
            next(error);
        }
    }

    listar = async (req, res, next) => {
        try {
            const habilidades = await this.listarHabilidades.execute();
            res.status(200).json(habilidades);
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req, res, next) => {
        try {
            const habilidad = await this.obtenerHabilidad.execute(req.params.id);
            res.status(200).json(habilidad);
        } catch (error) {
            next(error);
        }
    }

    obtenerPorCV = async (req, res, next) => {
        try {
            const habilidades = await this.obtenerHabilidadesPorCV.execute(req.params.cvId);
            res.status(200).json(habilidades);
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const habilidad = await this.actualizarHabilidad.execute(req.params.id, req.body);
            res.status(200).json(habilidad);
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req, res, next) => {
        try {
            await this.eliminarHabilidad.execute(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = HabilidadesController;
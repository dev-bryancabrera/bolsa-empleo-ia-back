class ExperienciaLaboralController {
    constructor({ crear, listarPorCV, actualizar, eliminar }) {
        this.crearUC = crear;
        this.listarPorCVUC = listarPorCV;
        this.actualizarUC = actualizar;
        this.eliminarUC = eliminar;
    }

    crear = async (req, res, next) => {
        try {
            const item = await this.crearUC.execute(req.body);
            res.status(201).json(item);
        } catch (error) {
            next(error);
        }
    }

    listarPorCV = async (req, res, next) => {
        try {
            const items = await this.listarPorCVUC.execute(req.params.cvId);
            res.status(200).json(items);
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const item = await this.actualizarUC.execute(req.params.id, req.body);
            res.status(200).json(item);
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req, res, next) => {
        try {
            await this.eliminarUC.execute(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ExperienciaLaboralController;

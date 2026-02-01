class CVController {
    constructor(
        crearCV,
        listarCVs,
        obtenerCV,
        obtenerCVPersona,
        actualizarCV,
        eliminarCV,
    ) {
        this.crearCV = crearCV;
        this.listarCVs = listarCVs;
        this.obtenerCV = obtenerCV;
        this.obtenerCVPersona = obtenerCVPersona;
        this.actualizarCV = actualizarCV;
        this.eliminarCV = eliminarCV;
    }

    crear = async (req, res, next) => {
        try {
            const cv = await this.crearCV.execute(req.body);
            res.status(201).json(cv);
        } catch (error) {
            next(error);
        }
    }

    listar = async (req, res, next) => {
        try {
            const cvs = await this.listarCVs.execute();
            res.status(200).json(cvs);
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req, res, next) => {
        try {
            const cv = await this.obtenerCV.execute(req.params.id);
            res.status(200).json(cv);
        } catch (error) {
            next(error);
        }
    }

    obtenerPorPersona = async (req, res, next) => {
        try {
            const cv = await this.obtenerCVPersona.execute(req.params.personaId);
            res.status(200).json(cv);
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const cv = await this.actualizarCV.execute(req.params.id, req.body);
            res.status(200).json(cv);
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req, res, next) => {
        try {
            await this.eliminarCV.execute(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CVController;
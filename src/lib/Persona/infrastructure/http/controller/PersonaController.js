class PersonaController {
    constructor({
        crearPersona,
        listarPersonas,
        obtenerPersona,
        actualizarPersona,
        eliminarPersona,
    }) {
        this.crearPersona = crearPersona;
        this.listarPersonas = listarPersonas;
        this.obtenerPersona = obtenerPersona;
        this.actualizarPersona = actualizarPersona;
        this.eliminarPersona = eliminarPersona;
    }

    crear = async (req, res, next) => {
        try {
            const persona = await this.crearPersona.execute(req.body);
            res.status(201).json(persona);
        } catch (error) {
            next(error);
        }
    }

    listar = async (req, res, next) => {
        try {
            const personas = await this.listarPersonas.execute();
            res.json(personas);
        } catch (error) {
            next(error);
        }
    }

    obtener = async (req, res, next) => {
        try {
            const persona = await this.obtenerPersona.execute(req.params.id);
            if (!persona) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }
            res.json(persona);
        } catch (error) {
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const persona = await this.actualizarPersona.execute(
                req.params.id,
                req.body
            );
            if (!persona) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }
            res.json(persona);
        } catch (error) {
            next(error);
        }
    }

    eliminar = async (req, res, next) => {
        try {
            const ok = await this.eliminarPersona.execute(req.params.id);
            if (!ok) {
                return res.status(404).json({ message: 'Persona no encontrada' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PersonaController;
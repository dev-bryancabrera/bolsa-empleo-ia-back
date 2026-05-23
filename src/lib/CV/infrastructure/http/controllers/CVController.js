class CVController {
    constructor({
        crearCV,
        listarCVs,
        obtenerCV,
        obtenerCVPersona,
        obtenerCVCompletoPorUsuario,
        actualizarCV,
        eliminarCV,
        validarCV,
        validarCVArchivo,
        verificarCompatibilidad,
        extraerCV,
        importarCV,
        optimizarCV,
    }) {
        this.crearCV = crearCV;
        this.listarCVs = listarCVs;
        this.obtenerCV = obtenerCV;
        this.obtenerCVPersona = obtenerCVPersona;
        this.obtenerCVCompletoPorUsuario = obtenerCVCompletoPorUsuario;
        this.actualizarCV = actualizarCV;
        this.eliminarCV = eliminarCV;
        this.validarCV = validarCV;
        this.validarCVArchivo = validarCVArchivo;
        this.verificarCompatibilidad = verificarCompatibilidad;
        this.extraerCV = extraerCV;
        this.importarCV = importarCV;
        this.optimizarCV = optimizarCV;
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
            if (!cv) return res.status(404).json({ success: false, mensaje: 'CV no encontrado' });
            res.status(200).json(cv);
        } catch (error) {
            const msg = error?.message || '';
            if (msg.includes('no encontró') || msg.includes('not found') || msg.includes('CV_NOT_FOUND')) {
                return res.status(404).json({ success: false, mensaje: 'CV no encontrado' });
            }
            next(error);
        }
    }

    obtenerCVPorUsuario = async (req, res, next) => {
        try {
            const cv = await this.obtenerCVCompletoPorUsuario.execute(req.params.usuarioId);
            res.status(200).json(cv);
        } catch (error) {
            const msg = (error?.message || '').toLowerCase();
            if (msg.includes('no encontró') || msg.includes('not found') || msg.includes('cv_not_found')) {
                return res.status(404).json({ success: false, mensaje: 'CV no encontrado' });
            }
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

    // ── Validar CV guardado en el perfil ──
    validar = async (req, res, next) => {
        try {
            const { cv_id } = req.body;
            if (!cv_id) return res.status(400).json({ message: 'cv_id es requerido' });

            const resultado = await this.validarCV.execute(cv_id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // ── Validar CV subido como archivo ──
    validarArchivo = async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'Se requiere un archivo' });

            const resultado = await this.validarCVArchivo.execute(
                req.file.buffer,
                req.file.mimetype,
                req.file.originalname
            );
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // ── Verificar compatibilidad con vacante ──
    compatibilidad = async (req, res, next) => {
        try {
            const { cv_id, url_vacante } = req.body;
            if (!cv_id) return res.status(400).json({ message: 'cv_id es requerido' });
            if (!url_vacante) return res.status(400).json({ message: 'url_vacante es requerido' });

            const resultado = await this.verificarCompatibilidad.execute(cv_id, url_vacante);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // ── Extraer datos de un CV subido como archivo ──
    extraer = async (req, res, next) => {
        try {
            if (!req.file) return res.status(400).json({ message: 'Se requiere un archivo' });

            const resultado = await this.extraerCV.execute(
                req.file.buffer,
                req.file.mimetype,
                req.file.originalname
            );
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // ── Importar datos extraídos al perfil del usuario ──
    importar = async (req, res, next) => {
        try {
            const personaId = req.usuario.id_persona;
            if (!personaId) {
                return res.status(400).json({ message: 'El usuario no tiene un perfil de persona asociado. Completa tu perfil primero.' });
            }

            const resultado = await this.importarCV.execute(personaId, req.body);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    // ── Optimizar CV con IA ──
    optimizar = async (req, res, next) => {
        try {
            const { cv_id } = req.body;
            if (!cv_id) return res.status(400).json({ message: 'cv_id es requerido' });

            const personaId = req.usuario?.id_persona || null;
            const resultado = await this.optimizarCV.execute(cv_id, personaId);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CVController;
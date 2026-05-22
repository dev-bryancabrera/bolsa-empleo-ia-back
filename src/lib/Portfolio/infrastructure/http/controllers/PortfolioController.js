class PortfolioController {
    constructor({ crearPortafolio, obtenerPortafolio, obtenerPortafolioPublico, actualizarPortafolio, optimizarPortafolio, obtenerDatosEditor }) {
        this.crearPortafolio = crearPortafolio;
        this.obtenerPortafolio = obtenerPortafolio;
        this.obtenerPortafolioPublico = obtenerPortafolioPublico;
        this.actualizarPortafolio = actualizarPortafolio;
        this.optimizarPortafolio = optimizarPortafolio;
        this.obtenerDatosEditor = obtenerDatosEditor;
    }

    crear = async (req, res, next) => {
        try {
            const personaId = req.usuario?.id_persona;
            const portfolio = await this.crearPortafolio.execute(personaId);
            res.status(201).json(portfolio);
        } catch (error) {
            // Si hay otro conflicto de unicidad en persona_id, devolver el existente
            if (error.name === 'SequelizeUniqueConstraintError') {
                try {
                    const existente = await this.crearPortafolio.portfolioRepository.obtenerPorPersonaId(personaId);
                    if (existente) return res.status(200).json(existente);
                } catch (_) { /* ignorar */ }
            }
            next(error);
        }
    }

    obtener = async (req, res, next) => {
        try {
            const personaId = req.usuario?.id_persona;
            const portfolio = await this.obtenerPortafolio.execute(personaId);
            res.status(200).json(portfolio);
        } catch (error) {
            if (error.message === 'PORTFOLIO_NOT_FOUND') {
                return res.status(404).json({ message: 'Portafolio no encontrado' });
            }
            next(error);
        }
    }

    obtenerPublico = async (req, res, next) => {
        try {
            const { slug } = req.params;
            const data = await this.obtenerPortafolioPublico.execute(slug);
            res.status(200).json(data);
        } catch (error) {
            if (error.message === 'PORTFOLIO_NOT_FOUND') {
                return res.status(404).json({ message: 'Portafolio no encontrado' });
            }
            if (error.message === 'PORTFOLIO_NOT_PUBLISHED') {
                return res.status(403).json({ message: 'Este portafolio no está publicado' });
            }
            next(error);
        }
    }

    actualizar = async (req, res, next) => {
        try {
            const personaId = req.usuario?.id_persona;
            const portfolio = await this.actualizarPortafolio.execute(personaId, req.body);
            res.status(200).json(portfolio);
        } catch (error) {
            if (error.message === 'PORTFOLIO_NOT_FOUND') {
                return res.status(404).json({ message: 'Portafolio no encontrado' });
            }
            if (error.message === 'SLUG_ALREADY_EXISTS') {
                return res.status(409).json({ message: 'Esa URL ya está en uso, elige otra' });
            }
            next(error);
        }
    }

    obtenerDatosEditorAction = async (req, res, next) => {
        try {
            const personaId = req.usuario?.id_persona;
            const datos = await this.obtenerDatosEditor.execute(personaId);
            res.status(200).json(datos);
        } catch (error) {
            next(error);
        }
    }

    optimizar = async (req, res, next) => {
        try {
            const personaId = req.usuario?.id_persona;
            const resultado = await this.optimizarPortafolio.execute(personaId);
            res.status(200).json(resultado);
        } catch (error) {
            if (error.message === 'PORTFOLIO_NOT_FOUND') {
                return res.status(404).json({ message: 'Primero crea tu portafolio' });
            }
            if (error.message === 'CV_NOT_FOUND') {
                return res.status(400).json({ message: 'Necesitas completar tu CV antes de optimizar el portafolio' });
            }
            next(error);
        }
    }
}

module.exports = PortfolioController;

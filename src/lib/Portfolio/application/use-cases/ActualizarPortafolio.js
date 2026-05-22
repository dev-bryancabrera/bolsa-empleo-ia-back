class ActualizarPortafolio {
    constructor(portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    async execute(personaId, datos) {
        const portfolio = await this.portfolioRepository.obtenerPorPersonaId(personaId);
        if (!portfolio) throw new Error('PORTFOLIO_NOT_FOUND');

        // Validar slug único si se quiere cambiar
        if (datos.url_slug && datos.url_slug !== portfolio.url_slug) {
            const ocupado = await this.portfolioRepository.existeSlug(datos.url_slug, portfolio.id);
            if (ocupado) throw new Error('SLUG_ALREADY_EXISTS');
        }

        const payload = {};
        if (datos.plantilla !== undefined) payload.plantilla = datos.plantilla;
        if (datos.publicado !== undefined) payload.publicado = datos.publicado;
        if (datos.url_slug !== undefined) payload.url_slug = datos.url_slug;
        if (datos.configuracion !== undefined) payload.configuracion = datos.configuracion;
        if (datos.contenido_extra !== undefined) payload.contenido_extra = datos.contenido_extra;

        return this.portfolioRepository.actualizar(portfolio.id, payload);
    }
}

module.exports = ActualizarPortafolio;

class PortfolioRepository {
    async crear(portfolio) { throw new Error('Not implemented'); }
    async obtenerPorPersonaId(personaId) { throw new Error('Not implemented'); }
    async obtenerPorSlug(slug) { throw new Error('Not implemented'); }
    async actualizar(id, datos) { throw new Error('Not implemented'); }
    async eliminar(id) { throw new Error('Not implemented'); }
    async existeSlug(slug, excludeId = null) { throw new Error('Not implemented'); }
}

module.exports = PortfolioRepository;

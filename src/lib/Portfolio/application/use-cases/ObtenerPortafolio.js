class ObtenerPortafolio {
    constructor(portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    async execute(personaId) {
        const portfolio = await this.portfolioRepository.obtenerPorPersonaId(personaId);
        if (!portfolio) throw new Error('PORTFOLIO_NOT_FOUND');
        return portfolio;
    }
}

module.exports = ObtenerPortafolio;

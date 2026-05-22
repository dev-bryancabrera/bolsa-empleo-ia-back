class ObtenerPortafolioPublico {
    constructor(portfolioRepository, personaRepository, cvRepository, habilidadesRepository, experienciaRepository, educacionRepository, idiomaRepository, certificacionRepository) {
        this.portfolioRepository = portfolioRepository;
        this.personaRepository = personaRepository;
        this.cvRepository = cvRepository;
        this.habilidadesRepository = habilidadesRepository;
        this.experienciaRepository = experienciaRepository;
        this.educacionRepository = educacionRepository;
        this.idiomaRepository = idiomaRepository;
        this.certificacionRepository = certificacionRepository;
    }

    async execute(slug) {
        const portfolio = await this.portfolioRepository.obtenerPorSlug(slug);
        if (!portfolio) throw new Error('PORTFOLIO_NOT_FOUND');
        if (!portfolio.publicado) throw new Error('PORTFOLIO_NOT_PUBLISHED');

        const [persona, cv] = await Promise.all([
            this.personaRepository.obtenerPorId(portfolio.persona_id),
            this.cvRepository.obtenerPorPersonaId(portfolio.persona_id),
        ]);

        if (!cv) {
            return { portfolio, persona, cv: null, experiencias: [], educaciones: [], habilidades: [], idiomas: [], certificaciones: [] };
        }

        const [experiencias, educaciones, habilidades, idiomas, certificaciones] = await Promise.all([
            this.experienciaRepository.listarPorCV(cv.id).catch(() => []),
            this.educacionRepository.listarPorCV(cv.id).catch(() => []),
            this.habilidadesRepository.obtenerPorCVId(cv.id).catch(() => []),
            this.idiomaRepository.listarPorCV(cv.id).catch(() => []),
            this.certificacionRepository.listarPorCV(cv.id).catch(() => []),
        ]);

        return { portfolio, persona, cv, experiencias, educaciones, habilidades, idiomas, certificaciones };
    }
}

module.exports = ObtenerPortafolioPublico;

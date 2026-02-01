class ObtenerHabilidadesPorCV {
    constructor(habilidadesRepository) {
        this.habilidadesRepository = habilidadesRepository;
    }

    async execute(cvId) {
        const habilidades = await this.habilidadesRepository.obtenerPorCVId(cvId);
        if (!habilidades || habilidades.length === 0) {
            throw new Error('No se encontraron habilidades para este CV');
        }
        return habilidades;
    }
}

module.exports = ObtenerHabilidadesPorCV;
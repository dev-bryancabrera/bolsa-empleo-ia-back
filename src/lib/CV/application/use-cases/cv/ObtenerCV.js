class ObtenerCV {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute(id) {
        const cv = await this.cvRepository.obtenerPorId(id);
        if (!cv) {
            throw new Error('CV no encontrado');
        }
        return cv;
    }
}

module.exports = ObtenerCV;
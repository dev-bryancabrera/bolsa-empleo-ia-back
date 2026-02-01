class EliminarCV {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute(id) {
        const cvExistente = await this.cvRepository.obtenerPorId(id);
        if (!cvExistente) {
            throw new Error('CV no encontrado');
        }

        return this.cvRepository.eliminar(id);
    }
}

module.exports = EliminarCV;
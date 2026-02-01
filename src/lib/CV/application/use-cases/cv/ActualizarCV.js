class ActualizarCV {
    constructor(cvRepository) {
        this.cvRepository = cvRepository;
    }

    async execute(id, dto) {
        const cvExistente = await this.cvRepository.obtenerPorId(id);
        if (!cvExistente) {
            throw new Error('CV no encontrado');
        }

        return this.cvRepository.actualizar(id, dto);
    }
}

module.exports = ActualizarCV;
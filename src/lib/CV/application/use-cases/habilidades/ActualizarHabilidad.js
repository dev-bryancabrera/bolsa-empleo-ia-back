class ActualizarHabilidad {
    constructor(habilidadesRepository) {
        this.habilidadesRepository = habilidadesRepository;
    }

    async execute(id, dto) {
        const habilidadExistente = await this.habilidadesRepository.obtenerPorId(id);
        if (!habilidadExistente) {
            throw new Error('Habilidad no encontrada');
        }

        return this.habilidadesRepository.actualizar(id, dto);
    }
}

module.exports = ActualizarHabilidad;
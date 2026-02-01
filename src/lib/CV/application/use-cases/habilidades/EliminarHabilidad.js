class EliminarHabilidad {
    constructor(habilidadesRepository) {
        this.habilidadesRepository = habilidadesRepository;
    }

    async execute(id) {
        const habilidadExistente = await this.habilidadesRepository.obtenerPorId(id);
        if (!habilidadExistente) {
            throw new Error('Habilidad no encontrada');
        }

        return this.habilidadesRepository.eliminar(id);
    }
}

module.exports = EliminarHabilidad;
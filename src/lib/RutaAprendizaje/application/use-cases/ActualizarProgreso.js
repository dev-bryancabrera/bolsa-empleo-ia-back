class ActualizarProgreso {
    constructor(rutaRepository) {
        this.rutaRepository = rutaRepository;
    }

    async execute(rutaId, progreso_fases) {
        const progresoStr = typeof progreso_fases === 'string'
            ? progreso_fases
            : JSON.stringify(progreso_fases);

        return this.rutaRepository.update(rutaId, { progreso_fases: progresoStr });
    }
}

module.exports = ActualizarProgreso;

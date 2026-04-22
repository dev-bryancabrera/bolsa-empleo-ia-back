class RegenerarTendencias {
    constructor(tendenciaRepository, generarTendencias) {
        this.tendenciaRepository = tendenciaRepository;
        this.generarTendencias = generarTendencias;
    }

    async execute(personaId) {
        try {
            // 1. Invalidar tendencias anteriores
            await this.tendenciaRepository.invalidarTendencias(personaId);

            // 2. Generar nuevas tendencias
            const resultado = await this.generarTendencias.execute(personaId);

            return {
                success: true,
                data: resultado.data,
                mensaje: 'Tendencias regeneradas exitosamente'
            };

        } catch (error) {
            console.error('Error en RegenerarTendencias:', error);
            throw error;
        }
    }
}

module.exports = RegenerarTendencias;
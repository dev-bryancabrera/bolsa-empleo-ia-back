class RegenerarTendencias {
    constructor(tendenciaRepository, generarTendencias) {
        this.tendenciaRepository = tendenciaRepository;
        this.generarTendencias = generarTendencias;
    }

    async execute(personaId) {
        try {
            // 1. Verificar si el perfil realmente cambió desde el último análisis
            const { hayCambios, tendenciaActual } = await this.generarTendencias.verificarCambios(personaId);

            if (!hayCambios && tendenciaActual) {
                // El CV y habilidades son idénticos al último análisis.
                // Reactivar la tendencia existente en lugar de llamar a la IA.
                const reactivada = await this.tendenciaRepository.reactivar(tendenciaActual.id);
                return {
                    success: true,
                    data: reactivada,
                    mensaje: 'Tu análisis está actualizado. No se detectaron cambios en tu CV ni en tus habilidades.',
                    sin_cambios: true,
                };
            }

            // 2. El perfil cambió — invalidar vigente y generar análisis fresco
            await this.tendenciaRepository.invalidarTendencias(personaId);
            const resultado = await this.generarTendencias.execute(personaId);

            return {
                success: true,
                data: resultado.data,
                mensaje: 'Análisis actualizado con los cambios de tu perfil profesional',
            };

        } catch (error) {
            console.error('Error en RegenerarTendencias:', error);
            throw error;
        }
    }
}

module.exports = RegenerarTendencias;

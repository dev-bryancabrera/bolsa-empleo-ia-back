class ObtenerTendencias {
    constructor(tendenciaRepository) {
        this.tendenciaRepository = tendenciaRepository;
    }

    async execute(personaId) {
        try {
            // Obtener tendencia vigente
            const tendencia = await this.tendenciaRepository.obtenerVigentePorPersona(personaId);

            if (!tendencia) {
                return {
                    success: false,
                    data: null,
                    mensaje: 'No hay tendencias vigentes. Genera nuevas tendencias.'
                };
            }

            // Parsear JSONs
            const tendenciaParseada = {
                id: tendencia.id,
                persona_id: tendencia.persona_id,
                estadisticas: JSON.parse(tendencia.estadisticas),
                rutas_aprendizaje: JSON.parse(tendencia.rutas_aprendizaje),
                recomendaciones: JSON.parse(tendencia.recomendaciones),
                empleos_sugeridos: JSON.parse(tendencia.empleos_sugeridos),
                habilidades_demandadas: JSON.parse(tendencia.habilidades_demandadas),
                plataformas_recomendadas: JSON.parse(tendencia.plataformas_recomendadas),
                tendencias_sector: JSON.parse(tendencia.tendencias_sector),
                datos_interesantes: JSON.parse(tendencia.datos_interesantes || '[]'),
                insights_personalizados: JSON.parse(tendencia.insights_personalizados),
                fecha_generacion: tendencia.fecha_generacion,
                vigente_hasta: tendencia.vigente_hasta
            };

            return {
                success: true,
                data: tendenciaParseada,
                mensaje: 'Tendencias obtenidas exitosamente'
            };

        } catch (error) {
            console.error('Error en ObtenerTendencias:', error);
            throw error;
        }
    }
}

module.exports = ObtenerTendencias;
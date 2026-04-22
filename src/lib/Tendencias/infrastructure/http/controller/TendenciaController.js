class TendenciaController {
    constructor({
        generarTendencias,
        obtenerTendencias,
        regenerarTendencias
    }) {
        this._generarTendencias = generarTendencias;
        this._obtenerTendencias = obtenerTendencias;
        this._regenerarTendencias = regenerarTendencias;
    }

    // 1. Obtener tendencias vigentes o generar nuevas si no existen
    obtenerTendencias = async (req, res) => {
        try {
            const personaId = req.params.id_persona;

            // Primero intentar obtener tendencias vigentes
            const resultado = await this._obtenerTendencias.execute(personaId);

            if (resultado.success && resultado.data) {
                return res.status(200).json({
                    success: true,
                    data: resultado.data,
                    mensaje: 'Tendencias obtenidas exitosamente'
                });
            }

            // Si no hay tendencias vigentes, generar nuevas
            const nuevasTendencias = await this._generarTendencias.execute(personaId);

            return res.status(201).json({
                success: true,
                data: this._parsearTendencia(nuevasTendencias.data),
                mensaje: 'Tendencias generadas exitosamente'
            });

        } catch (error) {
            console.error('Error en obtenerTendencias:', error);
            return res.status(500).json({
                success: false,
                mensaje: 'Error al obtener tendencias',
                error: error.message
            });
        }
    }

    // 2. Generar nuevas tendencias (forzar generación)
    generarTendencias = async (req, res) => {
        try {
            const personaId = req.params.id_persona;

            const resultado = await this._generarTendencias.execute(personaId);

            return res.status(201).json({
                success: true,
                data: this._parsearTendencia(resultado.data),
                mensaje: 'Tendencias generadas exitosamente'
            });

        } catch (error) {
            console.error('Error en generarTendencias:', error);
            return res.status(500).json({
                success: false,
                mensaje: 'Error al generar tendencias',
                error: error.message
            });
        }
    }

    // 3. Regenerar tendencias (invalida las anteriores y crea nuevas)
    regenerarTendencias = async (req, res) => {
        try {
            const personaId = req.params.id_persona;

            const resultado = await this._regenerarTendencias.execute(personaId);

            return res.status(200).json({
                success: true,
                data: this._parsearTendencia(resultado.data),
                mensaje: 'Tendencias regeneradas exitosamente'
            });

        } catch (error) {
            console.error('Error en regenerarTendencias:', error);
            return res.status(500).json({
                success: false,
                mensaje: 'Error al regenerar tendencias',
                error: error.message
            });
        }
    }

    _parsearTendencia(tendencia) {
        if (!tendencia) return null;

        return {
            ...tendencia.dataValues || tendencia,
            estadisticas: JSON.parse(tendencia.estadisticas),
            rutas_aprendizaje: JSON.parse(tendencia.rutas_aprendizaje),
            recomendaciones: JSON.parse(tendencia.recomendaciones),
            empleos_sugeridos: JSON.parse(tendencia.empleos_sugeridos),
            habilidades_demandadas: JSON.parse(tendencia.habilidades_demandadas),
            plataformas_recomendadas: JSON.parse(tendencia.plataformas_recomendadas),
            tendencias_sector: JSON.parse(tendencia.tendencias_sector),
            datos_interesantes: JSON.parse(tendencia.datos_interesantes || '[]'),
            insights_personalizados: JSON.parse(tendencia.insights_personalizados)
        };
    }
}

module.exports = TendenciaController;
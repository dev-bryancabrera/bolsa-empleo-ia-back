const TendenciaModel = require('../../../infrastructure/models/TendenciaModel.js');
const Tendencia = require('../domain/Tendencia.js');
const TendenciaRepository = require('../domain/TendenciaRepository.js');
const { Op } = require('sequelize');

class TendenciaRepositorySequelize extends TendenciaRepository {
    async crear(tendencia) {
        const tendenciaCreada = await TendenciaModel.create({
            persona_id: tendencia.persona_id,
            estadisticas: tendencia.estadisticas,
            rutas_aprendizaje: tendencia.rutas_aprendizaje,
            recomendaciones: tendencia.recomendaciones,
            empleos_sugeridos: tendencia.empleos_sugeridos,
            habilidades_demandadas: tendencia.habilidades_demandadas,
            plataformas_recomendadas: tendencia.plataformas_recomendadas,
            tendencias_sector: tendencia.tendencias_sector,
            analisis_brecha: tendencia.analisis_brecha || null,
            datos_interesantes: tendencia.datos_interesantes || null,
            vacantes_reales: tendencia.vacantes_reales || null,
            cursos_youtube: tendencia.cursos_youtube || null,
            insights_personalizados: tendencia.insights_personalizados,
            cv_fingerprint: tendencia.cv_fingerprint || null,
            fecha_generacion: tendencia.fecha_generacion,
            vigente_hasta: tendencia.vigente_hasta,
            created_at: new Date(),
        });
        return this._toEntity(tendenciaCreada);
    }

    async listar() {
        const tendencias = await TendenciaModel.findAll({
            order: [['created_at', 'DESC']]
        });
        return tendencias.map(t => this._toEntity(t));
    }

    async obtenerPorId(id) {
        const tendencia = await TendenciaModel.findByPk(id);
        return tendencia ? this._toEntity(tendencia) : null;
    }

    async obtenerPorPersona(personaId) {
        const tendencias = await TendenciaModel.findAll({
            where: { persona_id: personaId },
            order: [['created_at', 'DESC']]
        });
        return tendencias.map(t => this._toEntity(t));
    }

    async obtenerVigentePorPersona(personaId) {
        const ahora = new Date();
        const tendencia = await TendenciaModel.findOne({
            where: {
                persona_id: personaId,
                vigente_hasta: { [Op.gt]: ahora }
            },
            order: [['created_at', 'DESC']]
        });
        return tendencia ? this._toEntity(tendencia) : null;
    }

    async obtenerUltimaPorPersona(personaId) {
        const tendencia = await TendenciaModel.findOne({
            where: { persona_id: personaId },
            order: [['created_at', 'DESC']]
        });
        return tendencia ? this._toEntity(tendencia) : null;
    }

    async obtenerPorFingerprint(personaId, fingerprint) {
        if (!fingerprint) return null;
        const tendencia = await TendenciaModel.findOne({
            where: { persona_id: personaId, cv_fingerprint: fingerprint },
            order: [['created_at', 'DESC']]
        });
        return tendencia ? this._toEntity(tendencia) : null;
    }

    async reactivar(id) {
        const nuevaVigencia = new Date(Date.now() + 6 * 60 * 60 * 1000);
        await TendenciaModel.update(
            { vigente_hasta: nuevaVigencia, updated_at: new Date() },
            { where: { id } }
        );
        return this.obtenerPorId(id);
    }

    async actualizar(id, datos) {
        await TendenciaModel.update(datos, { where: { id } });
        return await this.obtenerPorId(id);
    }

    async eliminar(id) {
        const result = await TendenciaModel.destroy({ where: { id } });
        return result > 0;
    }

    async invalidarTendencias(personaId) {
        const ayer = new Date();
        ayer.setDate(ayer.getDate() - 1);

        await TendenciaModel.update(
            { vigente_hasta: ayer },
            {
                where: {
                    persona_id: personaId,
                    vigente_hasta: { [Op.gt]: new Date() }
                }
            }
        );
        return true;
    }

    _toEntity(tendenciaModel) {
        if (!tendenciaModel) return null;

        return new Tendencia({
            id: tendenciaModel.id,
            persona_id: tendenciaModel.persona_id,
            estadisticas: tendenciaModel.estadisticas,
            rutas_aprendizaje: tendenciaModel.rutas_aprendizaje,
            recomendaciones: tendenciaModel.recomendaciones,
            empleos_sugeridos: tendenciaModel.empleos_sugeridos,
            habilidades_demandadas: tendenciaModel.habilidades_demandadas,
            plataformas_recomendadas: tendenciaModel.plataformas_recomendadas,
            tendencias_sector: tendenciaModel.tendencias_sector,
            analisis_brecha: tendenciaModel.analisis_brecha,
            datos_interesantes: tendenciaModel.datos_interesantes,
            vacantes_reales: tendenciaModel.vacantes_reales,
            cursos_youtube: tendenciaModel.cursos_youtube,
            insights_personalizados: tendenciaModel.insights_personalizados,
            cv_fingerprint: tendenciaModel.cv_fingerprint,
            fecha_generacion: tendenciaModel.fecha_generacion,
            vigente_hasta: tendenciaModel.vigente_hasta,
            created_at: tendenciaModel.created_at,
            updated_at: tendenciaModel.updated_at
        });
    }
}

module.exports = TendenciaRepositorySequelize;

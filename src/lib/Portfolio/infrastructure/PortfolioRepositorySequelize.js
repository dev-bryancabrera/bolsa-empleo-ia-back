const PortfolioRepository = require('../domain/PortfolioRepository');
const PortfolioModel = require('../../../infrastructure/models/PortfolioModel');
const { Op } = require('sequelize');

class PortfolioRepositorySequelize extends PortfolioRepository {
    _toEntity(row) {
        if (!row) return null;
        const data = row.toJSON ? row.toJSON() : row;
        return {
            ...data,
            configuracion: data.configuracion ? JSON.parse(data.configuracion) : null,
            contenido_extra: data.contenido_extra ? JSON.parse(data.contenido_extra) : null,
        };
    }

    async crear(portfolio) {
        const row = await PortfolioModel.create({
            persona_id: portfolio.persona_id,
            plantilla: portfolio.plantilla || 'minimalista',
            publicado: portfolio.publicado ?? false,
            url_slug: portfolio.url_slug,
            configuracion: portfolio.configuracion ? JSON.stringify(portfolio.configuracion) : null,
            contenido_extra: portfolio.contenido_extra ? JSON.stringify(portfolio.contenido_extra) : null,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return this._toEntity(row);
    }

    async obtenerPorPersonaId(personaId) {
        const row = await PortfolioModel.findOne({ where: { persona_id: parseInt(personaId, 10) } });
        return this._toEntity(row);
    }

    async obtenerPorSlug(slug) {
        const row = await PortfolioModel.findOne({ where: { url_slug: slug } });
        return this._toEntity(row);
    }

    async actualizar(id, datos) {
        const payload = { ...datos, updated_at: new Date() };
        if (datos.configuracion && typeof datos.configuracion === 'object') {
            payload.configuracion = JSON.stringify(datos.configuracion);
        }
        if (datos.contenido_extra && typeof datos.contenido_extra === 'object') {
            payload.contenido_extra = JSON.stringify(datos.contenido_extra);
        }
        await PortfolioModel.update(payload, { where: { id } });
        const row = await PortfolioModel.findByPk(id);
        return this._toEntity(row);
    }

    async eliminar(id) {
        return PortfolioModel.destroy({ where: { id } });
    }

    async existeSlug(slug, excludeId = null) {
        const where = { url_slug: slug };
        if (excludeId) where.id = { [Op.ne]: excludeId };
        const count = await PortfolioModel.count({ where });
        return count > 0;
    }
}

module.exports = PortfolioRepositorySequelize;

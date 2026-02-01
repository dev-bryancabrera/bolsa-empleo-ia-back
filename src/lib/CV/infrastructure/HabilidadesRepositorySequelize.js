const HabilidadesRepository = require('../domain/habilidades/HabilidadesRepository');
const Habilidades = require('../domain/habilidades/Habilidades');
const HabilidadesModel = require('../../../infrastructure/models/HabilidadesModel.js');

class HabilidadesRepositorySequelize extends HabilidadesRepository {
    async crear(habilidad) {
        const row = await HabilidadesModel.create({
            id_cv: habilidad.id_cv,
            nombre: habilidad.nombre,
            categoria: habilidad.categoria,
            nivel: habilidad.nivel,
            anios_experiencia: habilidad.anios_experiencia,
        });

        return this._toEntity(row);
    }

    async obtenerPorId(id) {
        const row = await HabilidadesModel.findByPk(id);
        if (!row) return null;
        return this._toEntity(row);
    }

    async obtenerPorCVId(cvId) {
        const rows = await HabilidadesModel.findAll({
            where: { id_cv: cvId }
        });
        return rows.map((row) => this._toEntity(row));
    }

    async listar() {
        const rows = await HabilidadesModel.findAll();
        return rows.map((row) => this._toEntity(row));
    }

    async actualizar(id, datosHabilidad) {
        const row = await HabilidadesModel.findByPk(id);
        if (!row) return null;

        await row.update({
            id_cv: datosHabilidad.id_cv,
            nombre: datosHabilidad.nombre,
            categoria: datosHabilidad.categoria,
            nivel: datosHabilidad.nivel,
            anios_experiencia: datosHabilidad.anios_experiencia,
        });

        return this._toEntity(row);
    }

    async eliminar(id) {
        const row = await HabilidadesModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }

    _toEntity(row) {
        return new Habilidades({
            id: row.id,
            id_cv: row.id_cv,
            nombre: row.nombre,
            categoria: row.categoria,
            nivel: row.nivel,
            anios_experiencia: row.anios_experiencia,
            created_at: row.created_at,
        });
    }
}

module.exports = HabilidadesRepositorySequelize;
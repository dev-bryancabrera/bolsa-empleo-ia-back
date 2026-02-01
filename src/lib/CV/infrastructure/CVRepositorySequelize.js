const CVRepository = require('../domain/cv/CVRepository.js');
const CV = require('../domain/cv/CV.js');
const CVModel = require('../../../infrastructure/models/CVModel.js');

class CVRepositorySequelize extends CVRepository {
    async crear(cv) {
        const row = await CVModel.create({
            persona_id: cv.persona_id,
            titulo_profesional: cv.titulo_profesional,
            resumen_profesional: cv.resumen_profesional,
            nivel_educacion: cv.nivel_educacion,
            anios_experiencia: cv.anios_experiencia,
            sector_profesional: cv.sector_profesional,
            estado: cv.estado,
        });

        return this._toEntity(row);
    }

    async obtenerPorId(id) {
        const row = await CVModel.findByPk(id);
        if (!row) return null;
        return this._toEntity(row);
    }

    async obtenerPorPersonaId(personaId) {
        const row = await CVModel.findOne({
            where: { persona_id: personaId }
        });
        if (!row) return null;
        return this._toEntity(row);
    }

    async listar() {
        const rows = await CVModel.findAll();
        return rows.map((row) => this._toEntity(row));
    }

    async actualizar(id, datosCV) {
        const row = await CVModel.findByPk(id);
        if (!row) return null;

        await row.update({
            persona_id: datosCV.persona_id,
            titulo_profesional: datosCV.titulo_profesional,
            resumen_profesional: datosCV.resumen_profesional,
            nivel_educacion: datosCV.nivel_educacion,
            anios_experiencia: datosCV.anios_experiencia,
            sector_profesional: datosCV.sector_profesional,
            estado: datosCV.estado,
        });

        return this._toEntity(row);
    }

    async eliminar(id) {
        const row = await CVModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }

    _toEntity(row) {
        return new CV({
            id: row.id,
            persona_id: row.persona_id,
            titulo_profesional: row.titulo_profesional,
            resumen_profesional: row.resumen_profesional,
            nivel_educacion: row.nivel_educacion,
            anios_experiencia: row.anios_experiencia,
            sector_profesional: row.sector_profesional,
            estado: row.estado,
            created_at: row.created_at,
        });
    }
}

module.exports = CVRepositorySequelize;
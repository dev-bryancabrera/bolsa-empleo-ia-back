const ExperienciaLaboralModel = require('../../../infrastructure/models/ExperienciaLaboralModel');

class ExperienciaLaboralRepository {
    async crear(datos) {
        const row = await ExperienciaLaboralModel.create({
            id_cv: datos.id_cv,
            empresa: datos.empresa,
            cargo: datos.cargo,
            descripcion: datos.descripcion,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
            es_trabajo_actual: datos.es_trabajo_actual || false,
        });
        return row.toJSON();
    }

    async listarPorCV(cvId) {
        const rows = await ExperienciaLaboralModel.findAll({
            where: { id_cv: cvId }
        });
        return rows.map(row => row.toJSON());
    }

    async actualizar(id, datos) {
        const row = await ExperienciaLaboralModel.findByPk(id);
        if (!row) return null;
        await row.update({
            empresa: datos.empresa,
            cargo: datos.cargo,
            descripcion: datos.descripcion,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
            es_trabajo_actual: datos.es_trabajo_actual || false,
        });
        return row.toJSON();
    }

    async eliminar(id) {
        const row = await ExperienciaLaboralModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }
}

module.exports = ExperienciaLaboralRepository;

const EducacionModel = require('../../../infrastructure/models/EducacionModel');

class EducacionRepository {
    async crear(datos) {
        const row = await EducacionModel.create({
            id_cv: datos.id_cv,
            institucion: datos.institucion,
            titulo: datos.titulo,
            nivel: datos.nivel,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
            en_curso: datos.en_curso || false,
            descripcion: datos.descripcion || null,
        });
        return row.toJSON();
    }

    async listarPorCV(cvId) {
        const rows = await EducacionModel.findAll({
            where: { id_cv: cvId }
        });
        return rows.map(row => row.toJSON());
    }

    async actualizar(id, datos) {
        const row = await EducacionModel.findByPk(id);
        if (!row) return null;
        await row.update({
            institucion: datos.institucion,
            titulo: datos.titulo,
            nivel: datos.nivel,
            fecha_inicio: datos.fecha_inicio,
            fecha_fin: datos.fecha_fin || null,
            en_curso: datos.en_curso || false,
            descripcion: datos.descripcion || null,
        });
        return row.toJSON();
    }

    async eliminar(id) {
        const row = await EducacionModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }
}

module.exports = EducacionRepository;

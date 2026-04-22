const IdiomaModel = require('../../../infrastructure/models/IdiomaModel');

class IdiomaRepository {
    async crear(datos) {
        const row = await IdiomaModel.create({
            id_cv: datos.id_cv,
            nombre: datos.nombre,
            nivel: datos.nivel,
        });
        return row.toJSON();
    }

    async listarPorCV(cvId) {
        const rows = await IdiomaModel.findAll({
            where: { id_cv: cvId }
        });
        return rows.map(row => row.toJSON());
    }

    async actualizar(id, datos) {
        const row = await IdiomaModel.findByPk(id);
        if (!row) return null;
        await row.update({
            nombre: datos.nombre,
            nivel: datos.nivel,
        });
        return row.toJSON();
    }

    async eliminar(id) {
        const row = await IdiomaModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }
}

module.exports = IdiomaRepository;

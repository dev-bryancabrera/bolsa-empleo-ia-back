const CertificacionModel = require('../../../infrastructure/models/CertificacionModel');

class CertificacionRepository {
    async crear(datos) {
        const row = await CertificacionModel.create({
            id_cv: datos.id_cv,
            nombre: datos.nombre,
            emisor: datos.emisor || null,
            fecha: datos.fecha || null,
            url_credencial: datos.url_credencial || null,
        });
        return row.toJSON();
    }

    async listarPorCV(cvId) {
        const rows = await CertificacionModel.findAll({
            where: { id_cv: cvId }
        });
        return rows.map(row => row.toJSON());
    }

    async actualizar(id, datos) {
        const row = await CertificacionModel.findByPk(id);
        if (!row) return null;
        await row.update({
            nombre: datos.nombre,
            emisor: datos.emisor || null,
            fecha: datos.fecha || null,
            url_credencial: datos.url_credencial || null,
        });
        return row.toJSON();
    }

    async eliminar(id) {
        const row = await CertificacionModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }
}

module.exports = CertificacionRepository;

const RutaAprendizajeRepository = require('../domain/RutaAprendizajeRepository');
const { RutaAprendizajeModel } = require('../../../infrastructure/models');

class RutaAprendizajeRepositorySequelize extends RutaAprendizajeRepository {
    async save(ruta) {
        const created = await RutaAprendizajeModel.create({
            persona_id: ruta.persona_id,
            chat_id: ruta.chat_id || null,
            titulo: ruta.titulo,
            objetivo: ruta.objetivo || null,
            duracion_meses: ruta.duracion_meses || null,
            json_ruta: typeof ruta.json_ruta === 'string' ? ruta.json_ruta : JSON.stringify(ruta.json_ruta),
            progreso_fases: ruta.progreso_fases || '{}',
            estado: ruta.estado || 'activa',
        });
        return created.toJSON();
    }

    async findById(id) {
        const ruta = await RutaAprendizajeModel.findByPk(id);
        return ruta ? ruta.toJSON() : null;
    }

    async findByPersonaId(personaId) {
        const rutas = await RutaAprendizajeModel.findAll({
            where: { persona_id: personaId },
            order: [['created_at', 'DESC']],
        });
        return rutas.map(r => r.toJSON());
    }

    async update(id, data) {
        const [rows] = await RutaAprendizajeModel.update(
            { ...data, updated_at: new Date() },
            { where: { id } }
        );
        if (rows === 0) return null;
        return this.findById(id);
    }

    async delete(id) {
        const rows = await RutaAprendizajeModel.destroy({ where: { id } });
        return rows > 0;
    }
}

module.exports = RutaAprendizajeRepositorySequelize;

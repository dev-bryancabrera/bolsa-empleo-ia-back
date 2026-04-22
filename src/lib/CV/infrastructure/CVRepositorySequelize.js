const CVRepository = require('../domain/cv/CVRepository');
const CV = require('../domain/cv/CV');
const CVModel = require('../../../infrastructure/models/CVModel');
const HabilidadesModel = require('../../../infrastructure/models/HabilidadesModel');
const ExperienciaLaboralModel = require('../../../infrastructure/models/ExperienciaLaboralModel');
const EducacionModel = require('../../../infrastructure/models/EducacionModel');
const IdiomaModel = require('../../../infrastructure/models/IdiomaModel');
const CertificacionModel = require('../../../infrastructure/models/CertificacionModel');
const { UsuarioModel, PersonaModel } = require('../../../infrastructure/models');

class CVRepositorySequelize extends CVRepository {
    async crear(cv) {
        const row = await CVModel.create({
            persona_id: cv.persona_id,
            titulo_profesional: cv.titulo_profesional,
            resumen_profesional: cv.resumen_profesional,
            nivel_educacion: cv.nivel_educacion,
            anios_experiencia: cv.anios_experiencia,
            sector_profesional: cv.sector_profesional,
            telefono: cv.telefono,
            linkedin_url: cv.linkedin_url,
            github_url: cv.github_url,
            portfolio_url: cv.portfolio_url,
            ciudad: cv.ciudad,
            pais: cv.pais,
            disponibilidad: cv.disponibilidad,
            modalidad_trabajo: cv.modalidad_trabajo,
            estado: cv.estado,
        });

        return this._toEntity(row);
    }

    async obtenerPorId(id) {
        const row = await CVModel.findByPk(id);
        if (!row) return null;
        return this._toEntity(row);
    }

    async findCVByUserId(usuarioId) {
        const usuario = await UsuarioModel.findByPk(usuarioId, {
            include: [
                {
                    model: PersonaModel,
                    as: 'persona',
                    include: [
                        {
                            model: CVModel,
                            as: 'cv',
                            include: [
                                {
                                    model: HabilidadesModel,
                                    as: 'habilidades'
                                },
                                {
                                    model: ExperienciaLaboralModel,
                                    as: 'experiencias'
                                },
                                {
                                    model: EducacionModel,
                                    as: 'educaciones'
                                },
                                {
                                    model: IdiomaModel,
                                    as: 'idiomas'
                                },
                                {
                                    model: CertificacionModel,
                                    as: 'certificaciones'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!usuario || !usuario.persona || !usuario.persona.cv) {
            return null;
        }

        return usuario.persona.cv;
    }

    async obtenerPorPersonaId(personaId) {
        const row = await CVModel.findOne({
            where: { persona_id: personaId }
        });
        if (!row) return null;
        return this._toEntity(row);
    }

    async obtenerHabilidades(cv_id) {
        const rows = await HabilidadesModel.findAll({
            where: { id_cv: cv_id }
        });

        if (!rows || rows.length === 0) return [];

        return rows.map(row => this._habilidadToEntity(row));
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
            telefono: datosCV.telefono,
            linkedin_url: datosCV.linkedin_url,
            github_url: datosCV.github_url,
            portfolio_url: datosCV.portfolio_url,
            ciudad: datosCV.ciudad,
            pais: datosCV.pais,
            disponibilidad: datosCV.disponibilidad,
            modalidad_trabajo: datosCV.modalidad_trabajo,
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
            telefono: row.telefono,
            linkedin_url: row.linkedin_url,
            github_url: row.github_url,
            portfolio_url: row.portfolio_url,
            ciudad: row.ciudad,
            pais: row.pais,
            disponibilidad: row.disponibilidad,
            modalidad_trabajo: row.modalidad_trabajo,
            estado: row.estado,
            created_at: row.created_at,
        });
    }

    _habilidadToEntity(row) {
        return {
            id: row.id,
            nombre: row.nombre,
            categoria: row.categoria,
            nivel: row.nivel,
            anios_experiencia: row.anios_experiencia,
            id_cv: row.id_cv
        };
    }
}

module.exports = CVRepositorySequelize;

const PersonaRepository = require('../domain/PersonaRepository.js');
const Persona = require('../domain/Persona.js');
const PersonaModel = require('../../../infrastructure/models/PersonaModel.js');

class PersonaRepositorySequelize extends PersonaRepository {
    async crear(persona) {
        const row = await PersonaModel.create({
            nombre: persona.nombre,
            apellido: persona.apellido,
            identificacion: persona.identificacion,
            telefono: persona.telefono,
            fecha_nacimiento: persona.fecha_nacimiento,
            direccion: persona.direccion,
            ciudad: persona.ciudad,
            pais: persona.pais,
            titulo_profesional: persona.titulo_profesional,
            descripcion: persona.descripcion,
            nivel_educativo: persona.nivel_educativo,
            genero: persona.genero,
            linkedin: persona.linkedin,
            github: persona.github,
            sitio_web: persona.sitio_web,
            modalidad_trabajo: persona.modalidad_trabajo,
            disponibilidad: persona.disponibilidad,
            salario_esperado: persona.salario_esperado,
            sector_interes: persona.sector_interes,
        });

        return this._toEntity(row);
    }

    async obtenerPorId(id) {
        const row = await PersonaModel.findByPk(id);
        if (!row) return null;
        return this._toEntity(row);
    }

    async listar() {
        const rows = await PersonaModel.findAll();
        return rows.map((row) => this._toEntity(row));
    }

    async actualizar(id, datosPersona) {
        const row = await PersonaModel.findByPk(id);
        if (!row) return null;

        await row.update({
            nombre: datosPersona.nombre,
            apellido: datosPersona.apellido,
            identificacion: datosPersona.identificacion,
            telefono: datosPersona.telefono,
            fecha_nacimiento: datosPersona.fecha_nacimiento,
            direccion: datosPersona.direccion,
            ciudad: datosPersona.ciudad,
            pais: datosPersona.pais,
            titulo_profesional: datosPersona.titulo_profesional,
            descripcion: datosPersona.descripcion,
            nivel_educativo: datosPersona.nivel_educativo,
            genero: datosPersona.genero,
            linkedin: datosPersona.linkedin,
            github: datosPersona.github,
            sitio_web: datosPersona.sitio_web,
            modalidad_trabajo: datosPersona.modalidad_trabajo,
            disponibilidad: datosPersona.disponibilidad,
            salario_esperado: datosPersona.salario_esperado,
            sector_interes: datosPersona.sector_interes,
        });

        return this._toEntity(row);
    }

    async eliminar(id) {
        const row = await PersonaModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }

    _toEntity(row) {
        return new Persona({
            id: row.id,
            nombre: row.nombre,
            apellido: row.apellido,
            identificacion: row.identificacion,
            telefono: row.telefono,
            fecha_nacimiento: row.fecha_nacimiento,
            direccion: row.direccion,
            ciudad: row.ciudad,
            pais: row.pais,
            created_at: row.created_at,
            titulo_profesional: row.titulo_profesional,
            descripcion: row.descripcion,
            nivel_educativo: row.nivel_educativo,
            genero: row.genero,
            linkedin: row.linkedin,
            github: row.github,
            sitio_web: row.sitio_web,
            modalidad_trabajo: row.modalidad_trabajo,
            disponibilidad: row.disponibilidad,
            salario_esperado: row.salario_esperado,
            sector_interes: row.sector_interes,
        });
    }
}

module.exports = PersonaRepositorySequelize;

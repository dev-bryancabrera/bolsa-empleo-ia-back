const PersonaRepository = require('../domain/PersonaRepository.js');
const Persona = require('../domain/Persona.js');
const PersonaModel = require('../../../infrastructure/models/PersonaModel.js');

class PersonaRepositorySequelize extends PersonaRepository {
    async crear(persona) {
        const row = await PersonaModel.create({
            id_usuario: persona.id_usuario,
            nombre: persona.nombre,
            apellido: persona.apellido,
            telefono: persona.telefono,
            fecha_nacimiento: persona.fecha_nacimiento,
            direccion: persona.direccion,
            ciudad: persona.ciudad,
            pais: persona.pais,
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
            id_usuario: datosPersona.id_usuario,
            nombre: datosPersona.nombre,
            apellido: datosPersona.apellido,
            telefono: datosPersona.telefono,
            fecha_nacimiento: datosPersona.fecha_nacimiento,
            direccion: datosPersona.direccion,
            ciudad: datosPersona.ciudad,
            pais: datosPersona.pais,
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
            id_usuario: row.id_usuario,
            nombre: row.nombre,
            apellido: row.apellido,
            telefono: row.telefono,
            fecha_nacimiento: row.fecha_nacimiento,
            direccion: row.direccion,
            ciudad: row.ciudad,
            pais: row.pais,
            created_at: row.created_at,
        });
    }
}

module.exports = PersonaRepositorySequelize;
// Infrastructure/Repositories/UsuarioRepositorySequelize.js
const UsuarioRepository = require('../domain/UsuarioRepository.js');
const Usuario = require('../domain/Usuario.js');
const UsuarioModel = require('../../../infrastructure/models/UsuarioModel.js');

class AdminsitracionRepositorySequelize extends UsuarioRepository {
    async crear(usuario) {
        const row = await UsuarioModel.create({
            id_persona: usuario.id_persona,
            email: usuario.email,
            password: usuario.password,
            rol: usuario.rol,
            foto_perfil: usuario.foto_perfil,
            estado: usuario.estado,
        });

        return this._toEntity(row);
    }

    async obtenerPorId(id) {
        const row = await UsuarioModel.findByPk(id);
        if (!row) return null;
        return this._toEntity(row);
    }

    async obtenerPorEmail(email) {
        const row = await UsuarioModel.findOne({ where: { email } });
        if (!row) return null;
        return this._toEntity(row);
    }

    async obtenerPorPersonaId(personaId) {
        const row = await UsuarioModel.findOne({ where: { id_persona: personaId } });
        if (!row) return null;
        return this._toEntity(row);
    }

    async listar() {
        const rows = await UsuarioModel.findAll();
        return rows.map((row) => this._toEntity(row));
    }

    async actualizar(id, datosUsuario) {
        const row = await UsuarioModel.findByPk(id);
        if (!row) return null;

        await row.update({
            id_persona: datosUsuario.id_persona,
            email: datosUsuario.email,
            password: datosUsuario.password,
            rol: datosUsuario.rol,
            foto_perfil: datosUsuario.foto_perfil,
            estado: datosUsuario.estado,
        });

        return this._toEntity(row);
    }

    async eliminar(id) {
        const row = await UsuarioModel.findByPk(id);
        if (!row) return false;
        await row.destroy();
        return true;
    }

    _toEntity(row) {
        return new Usuario({
            id: row.id,
            id_persona: row.id_persona,
            email: row.email,
            password: row.password,
            rol: row.rol,
            foto_perfil: row.foto_perfil,
            estado: row.estado,
            created_at: row.created_at,
        });
    }
}

module.exports = AdminsitracionRepositorySequelize;
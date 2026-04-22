const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const UsuarioModel = require('../../../infrastructure/models/UsuarioModel');
const PersonaModel = require('../../../infrastructure/models/PersonaModel');

class UsuarioRepositorySequelize {

    async findByEmail(email) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: { email, activo: true }
            });
            return usuario;
        } catch (error) {
            throw new Error('Error al buscar usuario por email: ' + error.message);
        }
    }

    async findByGoogleId(googleId) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: { google_id: googleId, activo: true }
            });
            return usuario ? usuario.get({ plain: true }) : null;
        } catch (error) {
            throw new Error('Error al buscar usuario por Google ID: ' + error.message);
        }
    }

    async findAll() {
        try {
            const usuarios = await UsuarioModel.findAll({
                where: { activo: true },
                attributes: { exclude: ['password'] },
                include: [{ model: PersonaModel, as: 'persona' }]
            });
            return usuarios.map(usuario => usuario.get({ plain: true }));
        } catch (error) {
            throw new Error('Error al listar usuarios: ' + error.message);
        }
    }

    async findById(id) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: { id, activo: true },
                attributes: { exclude: ['password'] }
            });
            return usuario;
        } catch (error) {
            throw new Error('Error al buscar usuario: ' + error.message);
        }
    }

    async findByIdWithPersona(id) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: { id, activo: true },
                attributes: { exclude: ['password'] },
                include: [{ model: PersonaModel, as: 'persona' }]
            });
            return usuario;
        } catch (error) {
            throw new Error('Error al buscar usuario con persona: ' + error.message);
        }
    }

    async findPersonByUserId(id) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: { id, activo: true },
                attributes: { exclude: ['password'] },
                include: [{
                    model: PersonaModel,
                    as: 'persona',
                    required: true
                }]
            });

            if (!usuario) return null;
            return usuario.get({ plain: true });
        } catch (error) {
            throw new Error('Error al buscar usuario con persona: ' + error.message);
        }
    }

    async create(usuarioData) {
        try {
            const hashedPassword = await bcrypt.hash(usuarioData.password, 10);
            const row = await UsuarioModel.create({
                ...usuarioData,
                password: hashedPassword
            });
            const { password, ...usuarioSinPassword } = row.toJSON();
            return usuarioSinPassword;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error('El email ya está registrado');
            }
            throw new Error('Error al crear usuario: ' + error.message);
        }
    }

    async update(id, usuarioData) {
        try {
            if (usuarioData.password) {
                usuarioData.password = await bcrypt.hash(usuarioData.password, 10);
            }
            await UsuarioModel.update(usuarioData, {
                where: { id, activo: true }
            });
            return await this.findById(id);
        } catch (error) {
            throw new Error('Error al actualizar usuario: ' + error.message);
        }
    }

    // ─── Recuperación de contraseña ────────────────────────────────────────

    async updateResetToken(id, token, expires) {
        try {
            await UsuarioModel.update(
                { reset_token: token, reset_token_expires: expires },
                { where: { id } }
            );
        } catch (error) {
            throw new Error('Error al guardar token de recuperación: ' + error.message);
        }
    }

    async findByResetToken(token) {
        try {
            const usuario = await UsuarioModel.findOne({
                where: {
                    reset_token: token,
                    reset_token_expires: { [Op.gt]: new Date() },
                    activo: true
                }
            });
            return usuario ? usuario.get({ plain: true }) : null;
        } catch (error) {
            throw new Error('Error al buscar token de recuperación: ' + error.message);
        }
    }

    async updatePassword(id, hashedPassword) {
        try {
            await UsuarioModel.update(
                { password: hashedPassword },
                { where: { id } }
            );
        } catch (error) {
            throw new Error('Error al actualizar contraseña: ' + error.message);
        }
    }

    async clearResetToken(id) {
        try {
            await UsuarioModel.update(
                { reset_token: null, reset_token_expires: null },
                { where: { id } }
            );
        } catch (error) {
            throw new Error('Error al limpiar token: ' + error.message);
        }
    }
}

module.exports = UsuarioRepositorySequelize;
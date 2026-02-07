const bcrypt = require('bcrypt');
const UsuarioModel = require('../../../infrastructure/models/UsuarioModel');
const PersonaModel = require('../../../infrastructure/models/PersonaModel');
// Asegúrate de que la ruta a UsuarioModel sea la correcta

class UsuarioRepositorySequelize {

    async findByEmail(email) {
        try {
            // Usamos directamente el modelo importado
            const usuario = await UsuarioModel.findOne({
                where: {
                    email,
                    activo: true // O 'estado', verifica cómo se llama en tu DB
                }
            });
            return usuario;
        } catch (error) {
            throw new Error('Error al buscar usuario por email: ' + error.message);
        }
    }

    async findAll() {
        try {
            const usuarios = await UsuarioModel.findAll({
                where: { activo: true },
                attributes: { exclude: ['password'] },
                include: [{ model: PersonaModel, as: 'persona' }]
            });

            // Convertimos el array de instancias a objetos planos
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
            // Si necesitas el modelo Persona para el include, impórtalo aquí
            const PersonaModel = require('../../../infrastructure/models/PersonaModel');

            const usuario = await UsuarioModel.findOne({
                where: { id, activo: true },
                attributes: { exclude: ['password'] },
                include: [{
                    model: PersonaModel,
                    as: 'persona'
                }]
            });

            return usuario;
        } catch (error) {
            throw new Error('Error al buscar usuario con persona: ' + error.message);
        }
    }

    async findPersonByUserId(id) {
        try {
            const PersonaModel = require('../../../infrastructure/models/PersonaModel');

            const usuario = await UsuarioModel.findOne({
                where: {
                    id: id, // El ID del usuario
                    activo: true
                },
                attributes: {
                    exclude: ['password']
                },
                include: [{
                    model: PersonaModel,
                    as: 'persona', // Debe ser igual con el 'as' definido en la asociación del modelo
                    required: true // Esto hace un INNER JOIN, solo trae si tiene datos de persona
                }]
            });

            if (!usuario) {
                return null;
            }

            // Retornamos el objeto plano de Sequelize
            return usuario.get({ plain: true });

        } catch (error) {
            throw new Error('Error al buscar usuario con persona: ' + error.message);
        }
    }

    async create(usuarioData) {
        try {
            // Encripta la contraseña
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
}

module.exports = UsuarioRepositorySequelize;
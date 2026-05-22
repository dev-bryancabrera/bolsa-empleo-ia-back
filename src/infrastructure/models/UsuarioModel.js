const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const UsuarioModel = db.define(
    'Usuario',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_persona: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true, // null para usuarios de Google
        },
        rol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'user',
        },
        foto_perfil: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        // Campos Google OAuth
        supabase_uid: {
            type: DataTypes.STRING(36),
            allowNull: true,
            unique: true,
        },
        google_id: {
            type: DataTypes.STRING(191),
            allowNull: true,
        },
        google_nombre: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        google_foto_url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        proveedor: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'local',
        },
        // Campos recuperación de contraseña
        reset_token: {
            type: DataTypes.STRING(191), // utf8mb4: max seguro para índices
            allowNull: true,
        },
        reset_token_expires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'usuarios',
        timestamps: false,
        underscored: true,
    }
);

module.exports = UsuarioModel;
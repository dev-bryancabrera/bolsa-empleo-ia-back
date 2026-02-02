const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const UsuarioModel = db.define(
    'Usuario',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        id_persona: {
            type: DataTypes.BIGINT,
            allowNull: true,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        rol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'user',
        },
        foto_perfil: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
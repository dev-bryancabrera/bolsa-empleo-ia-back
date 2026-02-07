// Infrastructure/models/PersonaModel.js
const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const PersonaModel = db.define(
    'Persona',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        identificacion: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ciudad: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        pais: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'personas',
        timestamps: false,
        underscored: true,
    }
);

module.exports = PersonaModel;
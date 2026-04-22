const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const HabilidadesModel = db.define(
    'Habilidades',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_cv: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        nivel: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        anios_experiencia: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'habilidades',
        timestamps: false,
        underscored: true,
    }
);

module.exports = HabilidadesModel;
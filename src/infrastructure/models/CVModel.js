// Infrastructure/models/CVModel.js
const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const CVModel = db.define(
    'CV',
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        persona_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        titulo_profesional: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        resumen_profesional: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nivel_educacion: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        anios_experiencia: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        sector_profesional: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        estado: {
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
        tableName: 'cvs',
        timestamps: false,
        underscored: true,
    }
);

module.exports = CVModel;
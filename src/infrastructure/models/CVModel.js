// Infrastructure/models/CVModel.js
const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const CVModel = db.define(
    'CV',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        persona_id: {
            type: DataTypes.INTEGER,
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
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        linkedin_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        github_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        portfolio_url: {
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
        disponibilidad: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        modalidad_trabajo: {
            type: DataTypes.STRING(50),
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
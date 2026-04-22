const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const RutaAprendizajeModel = db.define(
    'RutaAprendizaje',
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
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        objetivo: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        duracion_meses: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        json_ruta: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        progreso_fases: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        estado: {
            type: DataTypes.ENUM('activa', 'completada', 'archivada'),
            allowNull: false,
            defaultValue: 'activa',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'rutas_aprendizaje',
        timestamps: false,
        underscored: true,
    }
);

module.exports = RutaAprendizajeModel;

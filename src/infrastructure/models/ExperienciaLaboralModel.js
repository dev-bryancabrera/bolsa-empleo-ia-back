const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const ExperienciaLaboralModel = db.define(
    'ExperienciaLaboral',
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
        empresa: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        cargo: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fecha_inicio: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        es_trabajo_actual: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'experiencias_laborales',
        timestamps: false,
        underscored: true,
    }
);

module.exports = ExperienciaLaboralModel;

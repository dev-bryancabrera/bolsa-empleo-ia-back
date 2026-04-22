const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const EducacionModel = db.define(
    'Educacion',
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
        institucion: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        titulo: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        nivel: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        fecha_inicio: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        fecha_fin: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        en_curso: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'educaciones_cv',
        timestamps: false,
        underscored: true,
    }
);

module.exports = EducacionModel;

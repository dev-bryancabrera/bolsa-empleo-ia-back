const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const IdiomaModel = db.define(
    'Idioma',
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
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        nivel: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    },
    {
        tableName: 'idiomas_cv',
        timestamps: false,
        underscored: true,
    }
);

module.exports = IdiomaModel;

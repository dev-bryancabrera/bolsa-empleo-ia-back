const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const CertificacionModel = db.define(
    'Certificacion',
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
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        emisor: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        fecha: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        url_credencial: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: 'certificaciones_cv',
        timestamps: false,
        underscored: true,
    }
);

module.exports = CertificacionModel;

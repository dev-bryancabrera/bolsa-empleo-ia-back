const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const ConversacionModel = db.define(
    'Conversacion',
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
        mensaje: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        respuesta: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        metadata: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        update_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: 'conversaciones',
        timestamps: false,
        underscored: true,
    }
);

module.exports = ConversacionModel;
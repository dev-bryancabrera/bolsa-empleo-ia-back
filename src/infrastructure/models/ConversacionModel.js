const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const ConversacionModel = db.define(
    'Conversacion',
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
            allowNull: false,
        },
        mensaje: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        respuesta: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tipo: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        respuesta_chat: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        json: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.TEXT,
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
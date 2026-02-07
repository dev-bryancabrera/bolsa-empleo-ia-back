const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const ChatModel = db.define(
    'Chat',
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
        titulo: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        estado: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'activo',
        },
        configuracion: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
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
        tableName: 'chats',
        timestamps: false,
        underscored: true,
    }
);

module.exports = ChatModel;
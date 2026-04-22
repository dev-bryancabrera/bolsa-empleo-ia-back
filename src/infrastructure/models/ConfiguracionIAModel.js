const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const ConfiguracionIAModel = db.define('ConfiguracionIA', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    persona_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    proveedor: {
        type: DataTypes.ENUM('groq', 'openai', 'anthropic'),
        defaultValue: 'groq',
        allowNull: false
    },
    modelo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'llama-3.3-70b-versatile'
    },
    api_key: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'configuracion_ia',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = ConfiguracionIAModel;

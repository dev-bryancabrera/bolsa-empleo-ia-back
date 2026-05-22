const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const PortfolioModel = db.define('Portfolio', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    persona_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    plantilla: {
        type: DataTypes.ENUM('minimalista', 'profesional', 'creativo'),
        defaultValue: 'minimalista',
    },
    publicado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    url_slug: {
        type: DataTypes.STRING(100),
        unique: true,
    },
    configuracion: {
        type: DataTypes.TEXT('long'),
        defaultValue: null,
    },
    contenido_extra: {
        type: DataTypes.TEXT('long'),
        defaultValue: null,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'portafolios',
    timestamps: false,
    underscored: true,
});

module.exports = PortfolioModel;

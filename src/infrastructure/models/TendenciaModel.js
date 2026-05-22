const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const TendenciaModel = db.define('Tendencia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    persona_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    estadisticas: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    rutas_aprendizaje: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    recomendaciones: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    empleos_sugeridos: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    habilidades_demandadas: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    plataformas_recomendadas: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tendencias_sector: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    analisis_brecha: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    datos_interesantes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    insights_personalizados: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fecha_generacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    vigente_hasta: {
        type: DataTypes.DATE,
        allowNull: false
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
    tableName: 'tendencias',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TendenciaModel;
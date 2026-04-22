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
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    rutas_aprendizaje: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    recomendaciones: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    empleos_sugeridos: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    habilidades_demandadas: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    plataformas_recomendadas: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    tendencias_sector: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    },
    analisis_brecha: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    datos_interesantes: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    insights_personalizados: {
        type: DataTypes.TEXT('long'),
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
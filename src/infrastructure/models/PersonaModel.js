// Infrastructure/models/PersonaModel.js
const { DataTypes } = require('sequelize');
const { db } = require('../database/ConnectMySQL');

const PersonaModel = db.define(
    'Persona',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        identificacion: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        direccion: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        ciudad: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        pais: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // Información profesional
        titulo_profesional: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nivel_educativo: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        genero: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        // Presencia digital
        linkedin: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        github: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        sitio_web: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // Preferencias laborales
        modalidad_trabajo: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        disponibilidad: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        salario_esperado: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        sector_interes: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'personas',
        timestamps: false,
        underscored: true,
    }
);

module.exports = PersonaModel;

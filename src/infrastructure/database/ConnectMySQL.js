// src/Infrastructure/database/MySQL.js
const { Sequelize } = require('sequelize');

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const initMySQL = async () => {
    try {
        await db.authenticate();
        console.log('✅ MySQL conectado correctamente');
    } catch (error) {
        console.error('❌ Error al conectar MySQL:', error);
        throw error;
    }
};

module.exports = { db, initMySQL };
// src/Infrastructure/database/ConnectDB.js
const { Sequelize } = require('sequelize');

const sslOptions = process.env.DB_SSL !== 'false'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const db = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: sslOptions,
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
            dialectOptions: sslOptions,
            pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        }
    );

const initMySQL = async () => {
    try {
        await db.authenticate();
        console.log('✅ PostgreSQL (Supabase) conectado correctamente');
    } catch (error) {
        console.error('❌ Error al conectar PostgreSQL:', error);
        throw error;
    }
};

module.exports = { db, initMySQL };
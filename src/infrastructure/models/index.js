const { db } = require('../database/ConnectMySQL');
const PersonaModel = require('./PersonaModel');
const ConversacionModel = require('./ConversacionModel');
const CVModel = require('./CVModel');
const HabilidadesModel = require('./HabilidadesModel');
const UsuarioModel = require('./UsuarioModel');
const crearAdminPorDefecto = require('../database/seeders/adminSeeder');

/*  CREACIÓN DE RELACIONES */

// 1. Relación Persona - Usuario (Uno a Uno)
PersonaModel.hasOne(UsuarioModel, { foreignKey: 'id_persona', as: 'cuenta' });
UsuarioModel.belongsTo(PersonaModel, { foreignKey: 'id_persona', as: 'persona' })

// 2. Relación Persona - CV (Uno a Uno)
PersonaModel.hasOne(CVModel, { foreignKey: 'persona_id', as: 'cv' });
CVModel.belongsTo(PersonaModel, { foreignKey: 'persona_id' });

// 3. Relación CV - Habilidades (Uno a Muchos)
CVModel.hasMany(HabilidadesModel, { foreignKey: 'id_cv', as: 'habilidades' });
HabilidadesModel.belongsTo(CVModel, { foreignKey: 'id_cv' });

// 4. Relación Persona - Conversacion (Uno a Muchos)
PersonaModel.hasMany(ConversacionModel, { foreignKey: 'persona_id', as: 'chats' });
ConversacionModel.belongsTo(PersonaModel, { foreignKey: 'persona_id' });

const syncModels = async () => {
  try {
    // await db.sync({ alter: true });  -->  Actualiza tablas sin perder datos
    // await db.sync({ force: true });  -->  Eliimina y recrea tablas
    await db.sync();
    await crearAdminPorDefecto(UsuarioModel);

    console.log('✅ Modelos y relaciones sincronizados con la base de datos');
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:', error);
    throw error;
  }
};

module.exports = {
  PersonaModel,
  ConversacionModel,
  CVModel,
  HabilidadesModel,
  UsuarioModel,
  syncModels,
};
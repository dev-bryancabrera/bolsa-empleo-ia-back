// Infrastructure/models/index.js
const { db } = require('../database/ConnectMySQL');
const PersonaModel = require('./PersonaModel.js');
const ConversacionModel = require('./ConversacionModel.js');
const CVModel = require('./CVModel.js');
const HabilidadesModel = require('./HabilidadesModel.js');
const UsuarioModel = require('./UsuarioModel.js');

/*  CREACIÓN DE RELACIONES */

// 1. Relación Persona - Usuario (Uno a Uno)
PersonaModel.hasOne(UsuarioModel, { foreignKey: 'persona_id', as: 'cuenta' });
UsuarioModel.belongsTo(PersonaModel, { foreignKey: 'persona_id' });

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
const { db } = require('../database/ConnectMySQL');
const PersonaModel = require('./PersonaModel');
const ConversacionModel = require('./ConversacionModel');
const ChatModel = require('./ChatModel');
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

// 4. Relación Persona - Chat (Uno a Muchos)
PersonaModel.hasMany(ChatModel, { foreignKey: 'persona_id', as: 'chats' });
ChatModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

// 5. Relación Chat - Conversacion (Uno a Muchos)
ChatModel.hasMany(ConversacionModel, { foreignKey: 'chat_id', as: 'conversaciones' });
ConversacionModel.belongsTo(ChatModel, { foreignKey: 'chat_id', as: 'chat' });

// 6. Relación Persona - Conversacion (Uno a Muchos) - Mantenida para acceso directo
PersonaModel.hasMany(ConversacionModel, { foreignKey: 'persona_id', as: 'conversaciones' });
ConversacionModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

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
  ChatModel,
  CVModel,
  HabilidadesModel,
  UsuarioModel,
  syncModels,
};
const { db } = require('../database/ConnectMySQL');
const PersonaModel = require('./PersonaModel');
const ConversacionModel = require('./ConversacionModel');
const ChatModel = require('./ChatModel');
const CVModel = require('./CVModel');
const HabilidadesModel = require('./HabilidadesModel');
const UsuarioModel = require('./UsuarioModel');
const TendenciaModel = require('./TendenciaModel');
const ExperienciaLaboralModel = require('./ExperienciaLaboralModel');
const EducacionModel = require('./EducacionModel');
const IdiomaModel = require('./IdiomaModel');
const CertificacionModel = require('./CertificacionModel');
const RutaAprendizajeModel = require('./RutaAprendizajeModel');
const ConfiguracionIAModel = require('./ConfiguracionIAModel');
const PortfolioModel = require('./PortfolioModel');
const crearAdminPorDefecto = require('../database/seeders/adminSeeder');
const supabase = require('../services/SupabaseClient');

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

// 7. Relación Persona - Tendencia (Uno a Muchos)
PersonaModel.hasMany(TendenciaModel, { foreignKey: 'persona_id', as: 'tendencias' });
TendenciaModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

// 8. Relación CV - ExperienciaLaboral (Uno a Muchos)
CVModel.hasMany(ExperienciaLaboralModel, { foreignKey: 'id_cv', as: 'experiencias' });
ExperienciaLaboralModel.belongsTo(CVModel, { foreignKey: 'id_cv' });

// 9. Relación CV - Educacion (Uno a Muchos)
CVModel.hasMany(EducacionModel, { foreignKey: 'id_cv', as: 'educaciones' });
EducacionModel.belongsTo(CVModel, { foreignKey: 'id_cv' });

// 10. Relación CV - Idioma (Uno a Muchos)
CVModel.hasMany(IdiomaModel, { foreignKey: 'id_cv', as: 'idiomas' });
IdiomaModel.belongsTo(CVModel, { foreignKey: 'id_cv' });

// 11. Relación CV - Certificacion (Uno a Muchos)
CVModel.hasMany(CertificacionModel, { foreignKey: 'id_cv', as: 'certificaciones' });
CertificacionModel.belongsTo(CVModel, { foreignKey: 'id_cv' });

// 12. Relación Persona - RutaAprendizaje (Uno a Muchos)
PersonaModel.hasMany(RutaAprendizajeModel, { foreignKey: 'persona_id', as: 'rutas_aprendizaje' });
RutaAprendizajeModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

// 13. Relación Persona - ConfiguracionIA (Uno a Uno)
PersonaModel.hasOne(ConfiguracionIAModel, { foreignKey: 'persona_id', as: 'configuracion_ia' });
ConfiguracionIAModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

// 14. Relación Persona - Portfolio (Uno a Uno)
PersonaModel.hasOne(PortfolioModel, { foreignKey: 'persona_id', as: 'portfolio' });
PortfolioModel.belongsTo(PersonaModel, { foreignKey: 'persona_id', as: 'persona' });

const syncModels = async () => {
  try {
    // alter: true → añade columnas nuevas sin borrar datos existentes
    // force: true → elimina y recrea tablas (solo para desarrollo desde cero)
    await db.sync({ alter: true });
    await crearAdminPorDefecto(UsuarioModel, supabase);

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
  TendenciaModel,
  ExperienciaLaboralModel,
  EducacionModel,
  IdiomaModel,
  CertificacionModel,
  RutaAprendizajeModel,
  ConfiguracionIAModel,
  PortfolioModel,
  syncModels,
};

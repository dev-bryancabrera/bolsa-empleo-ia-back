require('dotenv').config();
const GroqService = require('./src/infrastructure/services/GroqService');

async function testearGroq() {
    console.log("🚀 Iniciando prueba de TalentIA con Groq...\n");

    try {
        // Crear instancia del servicio
        const groqService = new GroqService();

        // TEST 1: Consulta simple
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("TEST 1: Consulta Simple");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        const respuesta1 = await groqService.generarRespuesta(
            "Hola, soy desarrollador junior con conocimientos en React. ¿Qué habilidades debería aprender?",
            {
                nombreUsuario: "Carlos",
                sector: "desarrollo web"
            }
        );

        console.log("📝 RESPUESTA DE TALENTIA:");
        console.log(respuesta1);

        // TEST 2: Generar ruta de aprendizaje completa
        console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("TEST 2: Ruta de Aprendizaje Personalizada");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

        const perfilPostulante = {
            nombre: "Ana García",
            nivel: "Junior",
            habilidades: ["HTML", "CSS", "JavaScript básico"],
            objetivos: "Convertirme en desarrolladora Full Stack",
            tiempoDisponible: "10 horas semanales",
            sector: "desarrollo web"
        };

        const rutaAprendizaje = await groqService.generarRutaAprendizaje(perfilPostulante);

        console.log("📚 RUTA DE APRENDIZAJE GENERADA:");
        console.log(rutaAprendizaje);

        console.log("\n\n✅ ¡Todas las pruebas completadas exitosamente!");

    } catch (error) {
        console.error("\n❌ Error en las pruebas:", error.message);
        process.exit(1);
    }
}

// Ejecutar las pruebas
testearGroq();
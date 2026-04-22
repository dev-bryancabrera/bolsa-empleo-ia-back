const express = require('express');
const multer = require('multer');
const router = express.Router();

// Validacion middleware de token JWT
const { auth } = require('../../../../../middleware/auth');

// Multer en memoria para archivos de CV (PDF, DOC, DOCX) — máx. 10 MB
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const ext = file.originalname.toLowerCase();
        if (allowed.includes(file.mimetype) || ext.endsWith('.pdf') || ext.endsWith('.docx') || ext.endsWith('.doc')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se aceptan archivos PDF o Word (.doc, .docx)'));
        }
    }
});

module.exports = (cvController) => {
    // ── Rutas IA ── (deben ir ANTES de las rutas con :id para evitar conflictos)
    router.post('/validar', auth, cvController.validar);
    router.post('/validar-archivo', auth, upload.single('cv'), cvController.validarArchivo);
    router.post('/compatibilidad', auth, cvController.compatibilidad);
    router.post('/extraer', auth, upload.single('cv'), cvController.extraer);
    router.post('/importar', auth, cvController.importar);

    // ── Rutas CRUD ──
    router.get('/', auth, cvController.listar);
    router.get('/persona/:personaId', auth, cvController.obtenerPorPersona);
    router.get('/usuario/:usuarioId', auth, cvController.obtenerCVPorUsuario);
    router.get('/:id', auth, cvController.obtener);
    router.post('/', auth, cvController.crear);
    router.put('/:id', auth, cvController.actualizar);
    router.delete('/:id', auth, cvController.eliminar);

    return router;
};
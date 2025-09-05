const express = require("express");
const router = express.Router();
const formationAdminController = require('../../Controllers/Admin/formationAdminController');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
            ];
    cb(null, allowedTypes.includes(file.mimetype));
};

const Upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
}).fields([
    { name: 'fiche_programme', maxCount: 1 },
    { name: 'cours_session', maxCount: 1 }
]);
router.get('/Form', formationAdminController.getFormations);

router.post('/Form', (req, res, next) => {
    Upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}, formationAdminController.addFormation);

router.put('/Form/:formationId/sessions/:sessionId', (req, res, next) => {
    Upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}, formationAdminController.updateSession);

router.delete('/:formationId/sessions/:sessionId', formationAdminController.deleteSession);

router.use((err, req, res, next) => {
    console.error('Erreur dans le router:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Une erreur est survenue'
    });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const formationAdminController = require('../../Controllers/Admin/formationAdminController');
const{addDomain}= require("../../Controllers/Admin/addDomainAdminController");
const { verifyToken } = require('../Admin/calendrierFormationRoutes'); // Middleware d'authentification

/*
// Routes pour les formations
//router.get("/formations", getFormation);
//router.get("/formations/:id", getFormationById);
//router.post("/formations", addFormation);
router.delete("/DEL/:id_formation", deleteFormation);
router.put("/update/:id_formation", (req, res, next) => {    next();  }, updateFormation);
router.put("/:id/sessions/:id_session",updateSession);
router.delete("/formations/:id_formation/sessions/:id_session", deleteSession);
router.post("/addFormation", upload.array("fiche_programme"), addFormation);

router.post('/addDomain',addDomain);

router.get('/Form',getFormation);
*/
// Routes
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configuration Multer
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname)); // Format: timestamp-random.extension
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
        }
    },
    limits: { 
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 10 // Maximum 10 fichiers
    }
});

// Routes
router.get('/Form', formationAdminController.getFormations);

router.post(
    '/Form',
    upload.array('fiche_programme', 10), // Accepte jusqu'à 10 fichiers
    formationAdminController.addFormation
);

router.post(
    '/Form',
    upload.single('fiche_programme'), // Accepte un seul fichier
    formationAdminController.addSession
);



// Middleware de gestion d'erreur pour Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Erreur spécifique à Multer (ex: taille de fichier dépassée)
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        // Autres erreurs
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
    next();
});

module.exports = router;
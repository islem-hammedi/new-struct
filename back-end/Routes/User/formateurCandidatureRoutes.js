const express = require('express');
const router = express.Router();
const FormateurCandidatureController = require('../../Controllers/User/FormateurCandidatureController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/candidatures');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
        }
    }
});

const controller = new FormateurCandidatureController();

router.post('/', upload.fields([{ name: 'cv', maxCount: 1 }]), (req, res) => {
    controller.submitCandidature(req, res);
});
router.get('/', (req, res) => {
    controller.getDemandes(req, res);
});
module.exports = router;
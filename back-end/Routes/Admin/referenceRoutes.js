const express = require('express');
const router = express.Router();
const AddReferenceController = require('../../Controllers/Admin/addReferenceController');
const upload = require('../../middlewares/uploadMiddleware');

const referenceController = new AddReferenceController();

router.post('/references', 
    upload.single('logo'),
    referenceController.addReference.bind(referenceController)
);

module.exports = router;
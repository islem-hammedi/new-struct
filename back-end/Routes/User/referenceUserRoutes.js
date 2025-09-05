const express = require("express");
const router = express.Router();
const referenceController = require("../../Controllers/User/referenceController");

router.get("/getReferences", referenceController.getReferences); 
module.exports = router;
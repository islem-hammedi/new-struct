const express = require('express');
const router = express.Router();
const{ getDomainesWithSessions,getCurrentYearSessions, calendrierFormation}= require('../../Controllers/Admin/calendrierFormationController');
router.post("/sessions/save", calendrierFormation);
router.get("/domaines-with-sessions", getDomainesWithSessions);
//router.get('/sessions/current-year',getCurrentYearSessions);

module.exports = router;
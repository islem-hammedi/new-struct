const express = require('express');
const router = express.Router();
const{ getDomainesWithSessions,getCalendarSessions, calendrierFormation, deletSessionFromCalendrier}= require('../../Controllers/Admin/calendrierFormationController');
router.post("/sessions/save", calendrierFormation);
router.get("/calendrier", getDomainesWithSessions);
router.get("/SessionCalendrier", getCalendarSessions);
router.delete('/sessions/:id',deletSessionFromCalendrier) 

module.exports = router;
const express = require('express');
const router = express.Router();

const {
    getSessions,
    getAllSessionsWithAverages,
    getAdminStats,
  getSessionStats,
}= require('../../Controllers/Admin/chartAdminController');

router.get('/avis/sessions/with-averages', getAllSessionsWithAverages);
router.get('/avis/sessions', getSessions);
router.get('/stats/admins', getAdminStats);
router.get('/stats/sessions', getSessionStats);

module.exports = router;
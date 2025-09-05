const express = require('express');
const router = express.Router();

const chartController = require('../../Controllers/Admin/statsController');

//router.get('/avis/sessions/with-averages', getAllSessionsWithAverages);
//router.get('/avis/sessions', getSessions);
router.get('/stats/admins', chartController.getAdminStats);
//router.get('/stats/sessions', getSessionStats);
router.get('/stats',chartController.getEvaluationStats);
router.get('/',chartController.getEvaluations);
router.get('/session/:session',chartController.getSessionEvaluation);
router.get('/stats/moyennes', chartController.getMoyenneNotes);
router.get('/:id/comments', chartController.getThemeComments);
router.get('/stats/sessions', chartController.getSessionStatusStats);


module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getAccesByAdmin,
  updateAccesByAdmin,
  getAllAccess,
} = require('../../Controllers/Admin/accesAdminController');


router.get('/acces', getAllAccess);
router.get('/admin/:id_admin/acces', getAccesByAdmin);
router.put('/admin/:id_admin/acces', updateAccesByAdmin);
module.exports = router;

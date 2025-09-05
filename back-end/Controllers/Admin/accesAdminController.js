
const accesService = require('../../services/admin/accesService');

class AccesController {
  async getAllAccess(req, res) {
    try {
      const accesses = await accesService.getAllAccess();
      res.json(accesses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAccesByAdmin(req, res) {
    try {
      const access = await accesService.getAdminAccess(req.params.id_admin);
      if (!access) {
        return res.status(404).json({ error: 'Administrateur non trouvé' });
      }
      res.json(access);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAccesByAdmin(req, res) {
    try {
      const success = await accesService.updateAdminAccess(
        req.params.id_admin,
        req.body.id_acces
      );
      if (!success) {
        return res.status(404).json({ error: 'Administrateur non trouvé' });
      }
      res.json({ message: 'Accès mis à jour avec succès' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AccesController();
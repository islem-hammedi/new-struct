
const adminService = require('../../services/admin/adminService');

class AdminController {
  async addAdmin(req, res) {
    try {
      const newAdmin = await adminService.createAdmin(req.body);
      res.status(201).json({
        message: 'Administrateur ajouté avec succès',
        admin: newAdmin
      });
    } catch (error) {
      console.error('Erreur:', error.message);
      const status = error.message.includes('existe déjà') ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  async getAllAdmins(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      res.status(200).json(admins);
    } catch (error) {
      console.error('Erreur dans AdminController:', error);
      res.status(500).json({ 
        message: 'Erreur serveur lors de la récupération des administrateurs',
        error: error.message 
      });
    }
  }

  async updateAdmin(req, res) {
    try {
      const updatedAdmin = await adminService.updateAdmin(req.params.id_admin, req.body);
      if (updatedAdmin) {
        res.status(200).json({ 
          message: 'Informations mises à jour avec succès',
          admin: updatedAdmin
        });
      } else {
        res.status(400).json({ message: 'Aucune modification effectuée' });
      }
    } catch (error) {
      console.error('Erreur:', error.message);
      const status = error.message.includes('non trouvé') ? 404 : 
                    error.message.includes('obligatoires') ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }
}

module.exports = new AdminController();
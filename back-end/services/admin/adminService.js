const adminRepository = require('../../repositories/admin/adminRepository');

class AdminService {
  async validateAccessLevel(acces) {
    if (![1, 2, 3, 4].includes(Number(acces))) {
      throw new Error('Accès invalide');
    }
  }

  async validatePasswordMatch(password, confirmPassword) {
    if (password !== confirmPassword) {
      throw new Error('Les mots de passe ne correspondent pas');
    }
  }

  async createAdmin(adminData) {
    await this.validateAccessLevel(adminData.acces);
    await this.validatePasswordMatch(adminData.mdp_admin, adminData.confirm_mdp);

    if (await adminRepository.checkEmailExists(adminData.email_admin)) {
      throw new Error('Un administrateur avec cet email existe déjà');
    }

    return adminRepository.createAdmin({
      nom_admin: adminData.nom_admin,
      email_admin: adminData.email_admin,
      mdp_admin: adminData.mdp_admin,
      telephone: adminData.telephone,
      poste: adminData.poste,
      id_acces: adminData.acces
    });
  }

  async getAllAdmins() {
    try {
      return await adminRepository.getAllAdmins();
    } catch (error) {
      console.error('Erreur dans AdminService:', error);
      throw new Error('Échec de la récupération des administrateurs');
    }
  }

  async updateAdmin(id, updateData) {
    if (!id) throw new Error("L'ID de l'administrateur est requis");
    if (!updateData.email_admin || !updateData.telephone || !updateData.poste) {
      throw new Error('Tous les champs sont obligatoires');
    }

    const admin = await adminRepository.getAdminById(id);
    if (!admin) throw new Error('Service:Administrateur non trouvé');

    return adminRepository.updateAdmin(id, updateData);
  }
}

module.exports = new AdminService();
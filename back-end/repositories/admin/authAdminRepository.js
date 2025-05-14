const db = require('../../connect');
const bcrypt = require('bcrypt');
const AuthAdmin = require('../../models/admin/authAdmin');

class AuthAdminRepository {
  async findByUsername(nom_admin) {
    const rows = await db.query(
      `SELECT admin.id_admin, admin.nom_admin, admin.mdp_admin, 
              admin.telephone, admin.poste, acces.nom_acces 
       FROM admin 
       LEFT JOIN acces ON admin.id_acces = acces.id_acces 
       WHERE admin.nom_admin = ?`,
      [nom_admin]
    );
    return rows.length ? new AuthAdmin(...Object.values(rows[0])) : null;
  }

  async comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new AuthAdminRepository();
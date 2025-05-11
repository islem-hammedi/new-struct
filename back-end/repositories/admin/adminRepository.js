const db = require('../../connect');
const bcrypt = require('bcrypt');
const Admin = require('../../models/admin/admin');

class AdminRepository {
  constructor() {
    this.initTable(); // Appel automatique à l'instanciation
  }
  async initTable() {
    const createTableQuery = `
     CREATE TABLE IF NOT EXISTS admin (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  nom_admin VARCHAR(100) NOT NULL,
  email_admin VARCHAR(100) UNIQUE NOT NULL,
  mdp_admin VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  poste VARCHAR(100),
  id_acces INT(11) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_acces) REFERENCES acces(id_acces)
   
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    
    try {
      await db.query(createTableQuery);
      //console.log('✅ Table admin initialisée');
    } catch (error) {
      console.error('❌ Erreur création table admin:', error);
      throw error;
    }
  }





  async checkEmailExists(email) {
    const [rows] = await db.promise().query('SELECT * FROM admin WHERE email_admin = ?', [email]);
    return rows.length > 0;
  }

  async createAdmin({ nom_admin, email_admin, mdp_admin, telephone, poste, id_acces }) {
    const hashedPassword = await bcrypt.hash(mdp_admin, 10);
    const [result] = await db.promise().query(
      'INSERT INTO admin (nom_admin, email_admin, mdp_admin, telephone, poste, id_acces) VALUES (?, ?, ?, ?, ?, ?)',
      [nom_admin, email_admin, hashedPassword, telephone, poste, id_acces]
    );
    return this.getAdminById(result.insertId);
  }

  async getAllAdmins() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, ac.nom_acces 
        FROM admin a
        LEFT JOIN acces ac ON a.id_acces = ac.id_acces
      `;
      
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async getAdminById(id) {
    const [rows] = await db.promise().query(
      'SELECT admin.*, acces.nom_acces FROM admin LEFT JOIN acces ON admin.id_acces = acces.id_acces WHERE id_admin = ?',
      [id]
    );
    return rows.length ? new Admin(rows[0]) : null;
  }

  async updateAdmin(id, { email_admin, telephone, poste, password }) {
    let updateFields = { email_admin, telephone, poste };
    let query = 'UPDATE admin SET email_admin = ?, telephone = ?, poste = ?';
    let params = [email_admin, telephone, poste];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', mdp_admin = ?';
      params.push(hashedPassword);
    }

    query += ' WHERE id_admin = ?';
    params.push(id);

    const [result] = await db.promise().query(query, params);
    return result.affectedRows > 0 ? this.getAdminById(id) : null;
  }
}

module.exports = new AdminRepository();
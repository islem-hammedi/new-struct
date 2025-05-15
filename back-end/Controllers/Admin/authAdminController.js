const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../../connect');

const login = (req, res) => {
  const { nom_admin, password } = req.body;

  if (!nom_admin || !password) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  const query = `SELECT admin.id_admin, admin.nom_admin, admin.mdp_admin, admin.telephone, admin.poste, acces.nom_acces 
                 FROM admin 
                 LEFT JOIN acces ON admin.id_acces = acces.id_acces 
                 WHERE admin.nom_admin = ?`;

  db.query(query, [nom_admin], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const admin = results[0];

    if (!admin.mdp_admin) {
      return res.status(500).json({ message: 'Erreur interne du serveur. Mot de passe non trouvé.' });
    }

    bcrypt.compare(password, admin.mdp_admin, (err, isMatch) => {
      if (err) {
        console.error('Erreur lors de la comparaison du mot de passe :', err);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects.' });
      }

      // Génération du token JWT
      const token = jwt.sign({ id: admin.id_admin, nom_admin: admin.nom_admin, nom_acces: admin.nom_acces }, process.env.SECRET_KEY, { expiresIn: '1h' });

      // Envoi du token dans un cookie sécurisé
      res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 });

      // Réponse avec les informations de l'administrateur
      return res.status(200).json({
        message: 'Connexion réussie',
        id_admin: admin.id_admin,
        nom_admin: admin.nom_admin,
        telephone: admin.telephone,
        poste: admin.poste,
        nom_acces: admin.nom_acces,
        token: token,
      });
    });
  });
};

const logout = (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Déconnexion réussie' });
};

module.exports = { login, logout };














{/*}

const authAdminService = require('../../services/admin/authAdminServices');

class AuthAdminController {
  async login(req, res) {
    try {
      const { nom_admin, password } = req.body;
      
      if (!nom_admin || !password) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
      }

      const { token, admin } = await authAdminService.login(nom_admin, password);

      res.cookie('auth_token', token, { 
        httpOnly: true, 
        maxAge: 3600000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.status(200).json({
        message: 'Connexion réussie',
        ...admin,
        token
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  logout(req, res) {
    try {
      res.clearCookie('auth_token');
      const result = authAdminService.logout();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la déconnexion' });
    }
  }
}

module.exports = new AuthAdminController();*/}
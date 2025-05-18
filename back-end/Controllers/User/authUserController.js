const authService = require('../../services/User/authUserService');

class AuthController {
    async register(req, res) {
        try {
          const { nom_complet, mail, pwd, telephone, adresse, id_entreprise } = req.body;
          
          const userId = await authService.register({
            nom_complet,
            mail,
            pwd,
            telephone,
            adresse,
            id_entreprise
          });
    
          res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            userId
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }
    
      /*async login(req, res) {
        try {
            const { nom_complet, pwd } = req.body;
            console.log('Données reçues:', { nom_complet, pwd });
    
            if (!nom_complet || !pwd) {
                return res.status(400).json({
                    success: false,
                    message: 'Nom d\'utilisateur et mot de passe requis'
                });
            }
    
            const { token, user } = await authService.login(nom_complet, pwd);
    
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 3600000
            });
    
            return res.status(200).json({
                message: 'Connexion réussie',
                token,
                user
            });
    
        } catch (error) {
            console.error('Erreur authController.login:', error);
            return res.status(401).json({
                message: error.message || 'Authentification échouée'
            });
        }
    }*/
        async login(req, res) {
          const { nom_complet, pwd } = req.body;
      
          try {
            const { token, userData } = await authService.login(nom_complet, pwd);
      
            return res
              .cookie('token', token, { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict' 
              })
              .status(200)
              .json({
                message: 'Connexion réussie',
                token,
                ...userData
              });
      
          } catch (error) {
            console.error('Erreur de connexion:', error);
            
            const status = {
              'Champs manquants': 400,
              'Nom d\'utilisateur incorrect': 401,
              'Mot de passe incorrect': 401
            }[error.message] || 500;
      
            return res.status(status).json({ 
              message: error.message || 'Erreur de connexion' 
            });
          }
        }

  logout(req, res) {
    res.clearCookie('token');
    res.status(200).json({ message: 'Déconnexion réussie' });
  }

  requestPasswordReset = async (req, res) => {
    try {
        const { mail } = req.body;
        if (!mail) {
            return res.status(400).json({ 
                success: false,
                message: 'Email requis' 
            });
        }

        await authService.requestPasswordReset(mail);
        res.status(200).json({ 
            success: true,
            message: 'Email de réinitialisation envoyé' 
        });
    } catch (error) {
        console.error('Controller Error - requestPasswordReset:', error);
        const statusCode = error.message.includes('non trouvé') ? 404 : 400;
        res.status(statusCode).json({ 
            success: false,
            message: error.message 
        });
    }
};

 resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Email et nouveau mot de passe requis' 
            });
        }

        await authService.resetPassword(email, newPassword);
        res.status(200).json({ 
            success: true,
            message: 'Mot de passe réinitialisé avec succès' 
        });
    } catch (error) {
        console.error('Controller Error - resetPassword:', error);
        const statusCode = error.message.includes('non trouvé') ? 404 : 400;
        res.status(statusCode).json({ 
            success: false,
            message: error.message 
        });
    }
};

changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const user = req.user;

    if ( !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Tous les champs sont requis' 
      });
    }

    const result = await authService.changePassword(
      user.id,
      newPassword,
      confirmPassword,
      user.isFormateur
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Controller Error - changePassword:', error);
    
    let statusCode = 500;
    if (error.message.includes('ne correspondent pas') || 
        error.message.includes('Le mot de passe doit') || 
        error.message.includes('champs sont requis')) {
      statusCode = 400;
    } else if (error.message.includes('non trouvé')) {
      statusCode = 404;
    } else if (error.message.includes('actuel incorrect')) {
      statusCode = 401;
    }

    res.status(statusCode).json({ 
      success: false,
      message: error.message 
    });
  }}}
module.exports = new AuthController();
const jwt = require('jsonwebtoken');
const authRepository = require('../../repositories/user/authUserRepository');
const bcrypt = require('bcrypt');

class AuthService {
    generateToken(user, isFormateur = false) {
        return jwt.sign(
          {
            id: isFormateur ? user.id_formateur : user.id_participant,
            nom_complet: user.nom_complet,
            isFormateur,
            role: isFormateur ? 'formateur' : 'participant'
          },
          process.env.SECRET_KEY,
          { expiresIn: '1h' }
        );
      }
    
      async register(participantData) {
        const existingUser = await authRepository.findByEmail(participantData.mail);
        if (existingUser) {
          throw new Error('Cet email est déjà utilisé');
        }
    
        return await authRepository.createParticipant(participantData);
      }
    
        async login(nom_complet, pwd) {
          if (!nom_complet || !pwd) {
            throw new Error('Champs manquants');
          }
      
          // Vérification formateur d'abord
          const formateur = await authRepository.findFormateurByUsername(nom_complet);
          if (formateur) {
            if (!formateur.mdp_formateur) {
              throw new Error('Mot de passe non configuré pour ce formateur');
            }
      
            const isMatch = await bcrypt.compare(pwd, formateur.mdp_formateur);
            if (!isMatch) {
              throw new Error('Mot de passe incorrect');
            }
      
            return {
              token: this.generateToken(formateur, true),
              userData: {
                isFormateur: true,
                id: formateur.id_formateur,
                nom_complet: formateur.nom_complet,
                telephone: formateur.telephone
              }
            };
          }
      
          // Vérification participant
          const participant = await authRepository.findParticipantByUsername(nom_complet);
          if (!participant) {
            throw new Error('Nom d\'utilisateur incorrect');
          }
      
          if (!participant.pwd) {
            throw new Error('Mot de passe non configuré pour ce participant');
          }
      
          const isMatch = await bcrypt.compare(pwd, participant.pwd);
          if (!isMatch) {
            throw new Error('Mot de passe incorrect');
          }
      
          return {
            token: this.generateToken(participant, false),
            userData: {
              isFormateur: false,
              id: participant.id_participant,
              nom_complet: participant.nom_complet,
              mail: participant.mail,
              telephone: participant.telephone,
              // ... autres champs participants
            }
          };
        }

        async requestPasswordReset(mail) {
          try {
            const user = await authRepository.findByEmail(mail);
            if (!user) {
              throw new Error('Aucun compte trouvé avec cet email');
            }
      
            const token = authRepository.generateResetToken();
            const expiresAt = new Date(Date.now() + 3600000); // 1 heure
            await authRepository.sendResetEmail(mail, token, expiresAt);
            
            return { success: true, message: 'Email de réinitialisation envoyé' };
          } catch (error) {
            console.error('Service Error - requestPasswordReset:', error);
            throw error;
          }
        }
      
        resetPassword = async (mail, newPassword) => {
          try {
            // Validation du mot de passe
            if (!newPassword || newPassword.length < 8) {
              throw new Error('Le mot de passe doit contenir au moins 8 caractères');
            }
        
            // Recherche de l'utilisateur
            const user = await authRepository.findByEmail(mail);
            if (!user) {
              throw new Error('Aucun compte trouvé avec cet email');
            }
        
            // Mise à jour du mot de passe
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await authRepository.updateParticipantPassword(user.id_participant, hashedPassword);
            
            return { 
              success: true, 
              message: 'Mot de passe réinitialisé avec succès' 
            };
          } catch (error) {
            console.error('Service Error - resetPassword:', error);
            throw error;
          }
        };
      
      async changePassword(id, newPassword, confirmPassword, isFormateur = false) {
        try {
          // Validation des champs requis
          if (!newPassword || !confirmPassword) {
            throw new Error('Tous les champs sont requis');
          }
      
          // Vérification de la correspondance des mots de passe
          if (newPassword !== confirmPassword) {
            throw new Error('Les mots de passe ne correspondent pas');
          }
      
          // Vérification de la force du mot de passe
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!passwordRegex.test(newPassword)) {
            throw new Error('Le mot de passe doit contenir 8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial');
          }
      
          // Vérification de l'existence de l'utilisateur
          const user = isFormateur 
            ? await this.authRepository.findFormateurById(id)
            : await this.authRepository.findParticipantById(id);
      
          if (!user) {
            throw new Error(isFormateur ? 'Formateur non trouvé' : 'Participant non trouvé');
          }
      
          // Mise à jour directe du mot de passe (sans vérification de l'ancien)
          if (!isFormateur) {
            const hashedPassword = await this.authRepository.hashPassword(newPassword);
            await this.authRepository.updateParticipantPassword(id, hashedPassword);
          } else {
            throw new Error('La modification de mot de passe pour les formateurs n\'est pas implémentée');
          }
      
          return { 
            success: true, 
            message: 'Mot de passe changé avec succès' 
          };
        } catch (error) {
          console.error('Service Error - changePassword:', error);
          throw error;
        }
      }}
module.exports = new AuthService();
/*
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AuthRepository = require('../../repositories/User/authUserRepository');

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  generateToken(user, isFormateur = false) {
    return jwt.sign(
      {
        id: isFormateur ? user.id_formateur : user.id_participant,
        nom_complet: user.nom_complet,
        isFormateur,
        role: isFormateur ? 'formateur' : 'participant'
      },
      process.env.SECRET_KEY || 'votre_secret_par_defaut',
      { expiresIn: '1h' }
    );
  }

  async register(participantData) {
    const existingUser = await this.authRepository.findByEmail(participantData.mail);
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    return await this.authRepository.createParticipant(participantData);
  }

  async login(nom_complet, pwd) {
    if (!nom_complet || !pwd) {
      throw new Error('Champs manquants');
    }

    // Vérification formateur d'abord
    const formateur = await this.authRepository.findFormateurByUsername(nom_complet);
    if (formateur) {
      if (!formateur.mdp_formateur) {
        throw new Error('Mot de passe non configuré pour ce formateur');
      }

      const isMatch = await bcrypt.compare(pwd, formateur.mdp_formateur);
      if (!isMatch) {
        throw new Error('Mot de passe incorrect');
      }

      return {
        token: this.generateToken(formateur, true),
        userData: {
          isFormateur: true,
          id: formateur.id_formateur,
          nom_complet: formateur.nom_complet,
          telephone: formateur.telephone
        }
      };
    }

    // Vérification participant
    const participant = await this.authRepository.findParticipantByUsername(nom_complet);
    if (!participant) {
      throw new Error('Nom d\'utilisateur incorrect');
    }

    if (!participant.pwd) {
      throw new Error('Mot de passe non configuré pour ce participant');
    }

    const isMatch = await bcrypt.compare(pwd, participant.pwd);
    if (!isMatch) {
      throw new Error('Mot de passe incorrect');
    }

    return {
      token: this.generateToken(participant, false),
      userData: {
        isFormateur: false,
        id: participant.id_participant,
        nom_complet: participant.nom_complet,
        mail: participant.mail,
        telephone: participant.telephone,
      }
    };
  }

  async requestPasswordReset(mail) {
    const user = await this.authRepository.findByEmail(mail);
    if (!user) {
      throw new Error('Aucun compte trouvé avec cet email');
    }

    const token = this.authRepository.generateResetToken();
    await this.authRepository.sendResetEmail(mail, token);
    
    return { success: true, message: 'Email de réinitialisation envoyé' };
  }

  async resetPassword(mail, newPassword) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    const user = await this.authRepository.findByEmail(mail);
    if (!user) {
      throw new Error('Aucun compte trouvé avec cet email');
    }

    await this.authRepository.updatePassword(
      user.isFormateur ? user.user.id_formateur : user.user.id_participant,
      newPassword,
      user.isFormateur
    );
    
    return { success: true, message: 'Mot de passe réinitialisé avec succès' };
  }

  async changePassword(userId, currentPassword, newPassword, isFormateur = false) {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }

    const user = isFormateur 
      ? await this.authRepository.findFormateurById(userId)
      : await this.authRepository.findParticipantById(userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isMatch = await bcrypt.compare(
      currentPassword, 
      isFormateur ? user.mdp_formateur : user.pwd
    );
    
    if (!isMatch) {
      throw new Error('Mot de passe actuel incorrect');
    }

    await this.authRepository.updatePassword(userId, newPassword, isFormateur);
    return { success: true, message: 'Mot de passe changé avec succès' };
  }
}

module.exports = AuthService;*/
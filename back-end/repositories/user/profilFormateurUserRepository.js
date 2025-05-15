const db = require('../../connect');
const Formateur = require('../../models/admin/formateur');
const Session = require('../../models/admin/session');
const Event = require('../../models/admin/evenement');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
class ProfilFormateurUserRepository {
   

    /*async getFormateurDetails(id_formateur) {
        try {
            const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
            const rawResponse = await db.query(query, [id_formateur]);

            let rows;
            if (Array.isArray(rawResponse)) {
                // mysql2/promise
                rows = rawResponse[0];
            } else if (rawResponse[0] && Array.isArray(rawResponse[0])) {
                // mysql pool
                rows = rawResponse[0];
            } else {
                rows = [rawResponse];
            }

            if (!rows || rows.length === 0) {
                throw new Error('Formateur non trouvé');
            }

            console.log('Données du formateur extraites:', rows[0]);
            //return rows[0];

            return new Formateur(rows[0]);
        } catch (err) {
            console.error('Repository Error - getFormateurDetails:', {
                message: err.message,
                stack: err.stack,
                id_formateur,
            });
            throw err;
        }
    }
    async getFormationsARealiser(id_formateur) {
        try {
            const results = await db.query(`
                SELECT 
                    s.id_session, 
                    t.nom_theme, 
                    t.code, 
                    d.nom_domaine, 
                    s.etat, 
                    s.type_session, 
                    s.fiche_prg AS fiche_prg  
                FROM session_formation s
                JOIN formations f ON s.id_formation = f.id_formation
                JOIN formateur frm ON s.id_formateur = frm.id_formateur
                JOIN theme t ON s.id_theme = t.id_theme
                JOIN domaine d ON d.id_domaine = f.id_domaine
                WHERE s.etat = 'A Realisé' 
                AND s.id_formateur = ?`, 
                [id_formateur]
            );

            return results.map(session => new Session({
                ...session,
                fiche_prg: session.fiche_prg ? `${process.env.BASE_URL}/uploads/${session.fiche_prg}` : null
            }));

        } catch (err) {
            console.error('Repository Error - getFormationsARealiser:', err);
            throw err;
        }
    }

    async getHistoriqueFormations(id_formateur) {
        try {
            const [results] = await db.query(`
                SELECT 
                    s.id_session, 
                    t.nom_theme, 
                    t.code, 
                    d.nom_domaine, 
                    s.etat, 
                    s.type_session, 
                    s.fiche_prg AS fiche_prg  
                FROM session_formation s
                JOIN formations f ON s.id_formation = f.id_formation
                JOIN formateur frm ON s.id_formateur = frm.id_formateur
                JOIN theme t ON s.id_theme = t.id_theme
                JOIN domaine d ON d.id_domaine = f.id_domaine
                WHERE s.etat = 'Déja Realisé' 
                AND s.id_formateur = 1 ?`, 
                [id_formateur]
            );

            return results.map(session => new Session({
                ...session,
                fiche_prg: session.fiche_prg ? `${process.env.BASE_URL}/uploads/${session.fiche_prg}` : null
            }));

        } catch (err) {
            console.error('Repository Error - getHistoriqueFormations:', err);
            throw err;
        }
    }

    async updatePassword(id_formateur, oldPassword, newPassword) {
        try {
            const [results] = await db.query(
                'SELECT mdp_formateur FROM formateur WHERE id_formateur = ?',
                [id_formateur]
            );

            if (results.length === 0) {
                throw new Error('Formateur non trouvé');
            }

            const storedPassword = results[0].mdp_formateur;
            const isMatch = await bcrypt.compare(oldPassword, storedPassword);

            if (!isMatch) {
                throw new Error('Mot de passe actuel incorrect');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await db.query(
                'UPDATE formateur SET mdp_formateur = ? WHERE id_formateur = ?',
                [hashedPassword, id_formateur]
            );

            return true;

        } catch (err) {
            console.error('Repository Error - updatePassword:', err);
            throw err;
        }
    }
*/
async getById(id_formateur) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
        
        db.query(query, [id_formateur], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return reject(new Error('Database operation failed'));
            }
            
            if (!results || results.length === 0) {
                console.log('No formateur found for ID:', id_formateur);
                return resolve(new Formateur({})); // Retourne un formateur vide
            }
            
            resolve(new Formateur(results[0]));
        });
    });
}

async getSessionsByStatus(id_formateur, status) {
    try {
        const query = `
            SELECT 
                s.id_session, 
                t.theme, 
                t.code, 
                d.domaine, 
                s.etat, 
                s.type_session, 
                s.fiche_prg  
            FROM session s
            JOIN formation f ON s.id_formation = f.id_formation
            JOIN formateur frm ON s.id_formateur = frm.id_formateur
            JOIN theme t ON s.id_theme = t.id_theme
            JOIN domaine d ON d.id_domaine = f.id_domaine
            WHERE s.etat = ? 
            AND s.id_formateur = ?`;
        
        const results = await db.query(query, [status, id_formateur]);
        
        // Traitement des résultats sans déstructuration
        const sessions = Array.isArray(results) ? results : [results];
        return sessions.map(session => new Session({
            ...session,
            fiche_prg: session.fiche_prg ? `${process.env.BASE_URL}/uploads/${session.fiche_prg}` : null
        }));
    } catch (err) {
        console.error('FormateurRepository Error - getSessionsByStatus:', err);
        throw new Error('Database error while fetching sessions');
    }
}


async updatePassword(id_formateur, hashedPassword) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE formateur SET mdp_formateur = ? WHERE id_formateur = ?';
      
      db.query(query, [hashedPassword, id_formateur], (error, result) => {
        if (error) {
          console.error('Repository Error - updatePassword:', error);
          return reject(new Error('Database error while updating password'));
        }
        
        // Vérifie si la mise à jour a affecté au moins une ligne
        resolve(result.affectedRows > 0);
      });
    });
  }

  async verifyPassword(id_formateur) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT mdp_formateur FROM formateur WHERE id_formateur = ?';
      
      db.query(query, [id_formateur], (error, results) => {
        if (error) {
          console.error('Repository Error - verifyPassword:', error);
          return reject(new Error('Database error while verifying password'));
        }
        
        if (!results || results.length === 0) {
          return resolve(null); // Aucun formateur trouvé
        }
        
        resolve(results[0].mdp_formateur);
      });
    });
  }

async getAllEvents() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM calendrier', (err, results) => {
        if (err) {
          console.error('Repository Error - getAllEvents:', err);
          return reject(new Error('Database error while fetching events'));
        }
        resolve(results);
      });
    });
  }

  async createEvent(event, date, created_by) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?)';
      
      db.query(query, [event, date, created_by], (err, result) => {
        if (err) {
          console.error('Repository Error - createEvent:', err);
          return reject(new Error('Database error while creating event'));
        }
        
        resolve({
          id: result.insertId,
          title,
          date,
          created_by
        });
      });
    });
  }

  async deleteEvent(id_event, created_by) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM calendrier WHERE id = ? AND created_by = ?';
      db.query(query, [id_event, created_by], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

    async sendModificationRequest(requestData) {
        try {
            const { telephone, nouveauxDonnes, nomFormateur, email, fichiers } = requestData;

            if (!telephone || !nouveauxDonnes || !nomFormateur || !email) {
                throw new Error('Tous les champs sont requis');
            }

            // Générer un token unique
            const token = crypto.randomBytes(20).toString('hex');

            // Configurer le transporteur email
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                    pass: process.env.EMAIL_PASSWORD || 'qqij aava gtxv hpdz'
                }
            });

            // Préparer les URLs de réponse
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            const acceptUrl = `${baseUrl}/apiUser/modification/response?token=${token}&decision=accept&email=${email}`;
            const rejectUrl = `${baseUrl}/apiUser/modification/response?token=${token}&decision=reject&email=${email}`;

            // Configurer l'email
            const mailOptions = {
                from: email,
                to: process.env.ADMIN_EMAIL || 'khadijabenabdelkader1206@gmail.com',
                subject: `Demande de modification - ${nomFormateur}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Nouvelle demande de modification</h2>
                        <p><strong>Formateur:</strong> ${nomFormateur}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Téléphone:</strong> ${telephone}</p>
                        <p><strong>Nouvelles données:</strong></p>
                        <p>${nouveauxDonnes}</p>
                        
                        <div style="margin: 20px 0;">
                            <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
                                Accepter
                            </a>
                            <a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                                Rejeter
                            </a>
                        </div>
                        
                        <p style="font-size: 0.8em; color: #666;">
                            Ces liens expireront dans 1 heure.
                        </p>
                    </div>
                `,
                attachments: fichiers?.map(file => ({
                    filename: file.originalname,
                    path: file.path
                })) || []
            };

            // Envoyer l'email
            await transporter.sendMail(mailOptions);

            // Nettoyer les fichiers temporaires
            if (fichiers) {
                fichiers.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }

            return { success: true, message: 'Demande envoyée avec succès' };

        } catch (error) {
            console.error('Repository Error - sendModificationRequest:', error);
            
            // Nettoyage en cas d'erreur
            if (requestData.fichiers) {
                requestData.fichiers.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }
            
            throw error;
        }
    }


    async handleModificationResponse(token, decision, email) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                    pass: process.env.EMAIL_PASSWORD || 'qqij aava gtxv hpdz'
                }
            });

            const responseMailOptions = {
                from: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                to: email,
                subject: `Réponse à votre demande de modification`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Votre demande de modification a été ${decision === 'accept' ? 'acceptée' : 'rejetée'}</h2>
                        <p>Nous vous informons que votre demande de modification a été <strong>${decision === 'accept' ? 'acceptée' : 'rejetée'}</strong> par l'administrateur.</p>
                        ${decision === 'accept' 
                            ? '<p>Vos modifications seront appliquées dans les plus brefs délais.</p>' 
                            : '<p>Pour plus d\'informations, vous pouvez contacter l\'administrateur.</p>'}
                    </div>
                `
            };

            await transporter.sendMail(responseMailOptions);

            // Ici vous pourriez mettre à jour le statut en base de données
            // await this.updateRequestStatus(token, decision);

            return { success: true, decision };

        } catch (error) {
            console.error('Repository Error - handleModificationResponse:', error);
            throw error;
        }
  };
}
module.exports = ProfilFormateurUserRepository;
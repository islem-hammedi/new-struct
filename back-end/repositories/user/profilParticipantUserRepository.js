const db = require('../../connect');
const Participant = require('../../models/admin/participant')
class ProfilParticipantUserRepository {
    
    async getParticipantProfile(id_participant) {
        return new Promise((resolve, reject) => {
            const query = 
            `
            SELECT p.id_participant AS id_participant,
    p.nom_complet AS nom_complet,
    p.mail AS mail,
    p.telephone AS telephone,
    p.adresse AS adresse, 
    p.CIN AS CIN,
    p.id_entreprise AS id_entreprise,
    e.nom_entreprise AS nom_entreprise,
    e.tel_entreprise AS tel_entreprise,
    e.email_entreprise AS email_entreprise,
    e.adr_entreprise AS adr_entreprise,
    e.matricule AS matricule
FROM participants p 
LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise 
WHERE p.id_participant = ?`;
            
            db.query(query, [id_participant], (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    return reject(new Error('Database operation failed'));
                }
                
                if (!results || results.length === 0) {
                    console.log('No participant found for ID:', id_participant);
                    return resolve(new Participant({})); // Retourne un formateur vide
                }
                
                resolve(new Participant(results[0]));
            });
        });
    }
    async updateParticipantProfile(id_participant, updateData) {
        return new Promise((resolve, reject) => {
            // Validation des données obligatoires
            if (!updateData.nom_complet || !updateData.mail) {
                return reject(new Error('Nom complet et email sont requis'));
            }
    
            db.beginTransaction(async (beginError) => {
                if (beginError) return reject(new Error('Échec de la transaction'));
    
                try {
                    let entrepriseId = updateData.id_entreprise || null;
    
                    // Traitement de l'entreprise si fournie
                    if (updateData.entreprise) {
                        if (updateData.entreprise.matricule) {
                            const checkEntreprise = await new Promise((resolve, reject) => {
                                db.query(
                                    'SELECT id_entreprise FROM entreprise WHERE matricule = ?',
                                    [updateData.entreprise.matricule],
                                    (err, results) => {
                                        if (err) reject(err);
                                        else resolve(results);
                                    }
                                );
                            });
    
                            if (checkEntreprise.length > 0) {
                                // Mise à jour entreprise existante
                                entrepriseId = checkEntreprise[0].id_entreprise;
                                await new Promise((resolve, reject) => {
                                    db.query(
                                        `UPDATE entreprise SET
                                            nom_entreprise = ?,
                                            tel_entreprise = ?,
                                            email_entreprise = ?,
                                            adr_entreprise = ?
                                        WHERE id_entreprise = ?`,
                                        [
                                            updateData.entreprise.nom_entreprise,
                                            updateData.entreprise.tel_entreprise,
                                            updateData.entreprise.email_entreprise,
                                            updateData.entreprise.adr_entreprise,
                                            entrepriseId
                                        ],
                                        (err, results) => {
                                            if (err) reject(err);
                                            else resolve(results);
                                        }
                                    );
                                });
                            } else {
                                // Création nouvelle entreprise
                                const newEntreprise = await new Promise((resolve, reject) => {
                                    db.query(
                                        `INSERT INTO entreprise SET
                                            nom_entreprise = ?,
                                            tel_entreprise = ?,
                                            email_entreprise = ?,
                                            adr_entreprise = ?,
                                            matricule = ?`,
                                        [
                                            updateData.entreprise.nom_entreprise,
                                            updateData.entreprise.tel_entreprise,
                                            updateData.entreprise.email_entreprise,
                                            updateData.entreprise.adr_entreprise,
                                            updateData.entreprise.matricule
                                        ],
                                        (err, results) => {
                                            if (err) reject(err);
                                            else resolve(results);
                                        }
                                    );
                                });
                                entrepriseId = newEntreprise.insertId;
                            }
                        }
                    }
    
                    // Mise à jour participant avec le nouvel entrepriseId
                    const updateParticipant = await new Promise((resolve, reject) => {
                        db.query(
                            `UPDATE participants SET
                                nom_complet = ?,
                                mail = ?,
                                telephone = ?,
                                adresse = ?,
                                CIN = ?,
                                id_entreprise = ?
                            WHERE id_participant = ?`,
                            [
                                updateData.nom_complet,
                                updateData.mail,
                                updateData.telephone || null,
                                updateData.adresse || null,
                                updateData.CIN || null,
                                entrepriseId, // Ici on utilise bien le entrepriseId déterminé plus haut
                                id_participant
                            ],
                            (err, results) => {
                                if (err) reject(err);
                                else resolve(results);
                            }
                        );
                    });
    
                    await new Promise((resolve, reject) => {
                        db.commit(err => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
    
                    resolve({
                        success: true,
                        message: 'Profil mis à jour avec succès',
                        affectedRows: updateParticipant.affectedRows,
                        entrepriseId: entrepriseId // Retourne l'ID pour vérification
                    });
                } catch (error) {
                    await new Promise((resolve, reject) => {
                        db.rollback(() => {
                            resolve();
                        });
                    });
                    console.error('Erreur Repository:', error);
                    reject(new Error(`Échec de la mise à jour: ${error.message}`));
                }
            });
        });
    }
}

module.exports = ProfilParticipantUserRepository;
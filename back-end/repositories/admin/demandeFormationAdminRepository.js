{/*const db = require('../../connect');

class DemandeFormationRepository {
  async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM demande_de_formation_personnalisee', (err, results) => {
        if (err) {
          console.error('Erreur DB:', err);
          return reject(err);
        }
        resolve(results);
      });
    });
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationRepository();*/}













const db = require('../../connect');

const getAllDemandesWithParticipants = () => {
    const query = `
        SELECT 
            d.*,
            p.nom_complet AS participant_nom_complet,
            p.mail AS participant_mail,
            p.telephone AS participant_telephone,
            p.badge AS participant_badge
        FROM 
            demande_de_formation_personnalisee d
        LEFT JOIN 
            participant p ON d.id_participant = p.id_participant
        ORDER BY d.createdAt DESC
    `;
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    getAllDemandesWithParticipants
};
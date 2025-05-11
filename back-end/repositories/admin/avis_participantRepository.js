const db = require('../../connect');
const Avis = require('../../models/admin/avis_p');

class AvisRepository {
  constructor() {
    this.initTable();
  }

  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS avis (
        id_avis INT PRIMARY KEY AUTO_INCREMENT,
        id_session INT NOT NULL,
        id_participant INT NOT NULL,
        commentaire TEXT,
        note INT,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        adaptation_programme_vie_pro INT,
        moyens_pedagogiques_utilises INT,
        convenance_horaires_formation INT,
        apports_niveau_professionnel INT,
        qualite_documentation_distribuee INT,
        maitrise_globale_sujets_presentes INT,
        traitement_exemples_travail INT,
        animations_seances INT,
        homogeneite_groupe INT,
        satisfaction_attentes INT,
        duree_formation INT,
        FOREIGN KEY (id_session) REFERENCES session(id_session) ON DELETE CASCADE,
        FOREIGN KEY (id_participant) REFERENCES participant(id_participant) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    return new Promise((resolve, reject) => {
      db.query(createTableQuery, (err) => {
        if (err) {
          console.error('❌ Erreur lors de la création de la table "avis":', err);
          return reject(new Error('Échec de l\'initialisation de la table avis'));
        }
        //console.log('✅ Table "avis" initialisée avec succès');
        resolve();
      });
    });
  }

  async getBySession(idSession) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          avis.id_avis, avis.id_session, avis.id_participant, avis.commentaire, avis.note,
          avis.date_creation, avis.adaptation_programme_vie_pro,
          avis.moyens_pedagogiques_utilises, avis.convenance_horaires_formation,
          avis.apports_niveau_professionnel, avis.qualite_documentation_distribuee,
          avis.maitrise_globale_sujets_presentes, avis.traitement_exemples_travail,
          avis.animations_seances, avis.homogeneite_groupe,
          avis.satisfaction_attentes, avis.duree_formation,
          participant.nom_complet, participant.nature_participant, participant.nom_entreprise
        FROM avis
        JOIN participant ON avis.id_participant = participant.id_participant
        WHERE avis.id_session = ?`;
      
      db.query(sql, [idSession], (err, results) => {
        if (err) {
          console.error('Erreur dans avisRepository.getBySession:', err);
          return reject(new Error('Échec de la récupération des avis'));
        }
        
        // Convertir les résultats en objets Avis
        const avisList = results.map(row => new Avis(row));
        resolve(avisList);
      });
    });
    
  }
  async getSessions() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM session', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async checkSessionExists(idSession) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT 1 FROM session WHERE id_session = ? LIMIT 1', 
        [idSession],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
        }
      );
    });
  }

  async checkParticipantExists(idParticipant) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT 1 FROM participant WHERE id_participant = ? LIMIT 1',
        [idParticipant],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
        }
      );
    });
  }
}

module.exports = new AvisRepository();
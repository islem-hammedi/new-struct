const db = require('../../connect');

class FeuillePresenceRepository {
  
  constructor() {
    this.initTable();
  }

  // Initialiser les tables si elles n'existent pas
  async initTable() {
    const createFeuillePresenceTable = `
      CREATE TABLE IF NOT EXISTS feuille_presence (
        id_presence INT AUTO_INCREMENT PRIMARY KEY,
        id_session INT NOT NULL,
        credit_impot BOOLEAN DEFAULT FALSE,
        droit_tirage VARCHAR(50),
        mode_formation VARCHAR(50),
        co_organisateurs TEXT,
        horaire_debut TIME,
        horaire_fin TIME,
        pause_debut TIME,
        pause_fin TIME,
        entreprise_beneficiaire VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_session) REFERENCES sessions(id_session) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    const createParticipantTable = `
      CREATE TABLE IF NOT EXISTS participant (
        id_participant INT AUTO_INCREMENT PRIMARY KEY,
        nom_complet VARCHAR(255) NOT NULL,
        mail VARCHAR(255),
        CIN VARCHAR(20) NOT NULL,
        telephone VARCHAR(20),
        direction_service VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_cin (CIN),
        INDEX idx_mail (mail)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    const createJointureTable = `
      CREATE TABLE IF NOT EXISTS feuille_presence_participants (
        id_presence INT NOT NULL,
        id_participant INT NOT NULL,
        id_session INT NOT NULL,
        emargement JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id_presence, id_participant, id_session),
        FOREIGN KEY (id_presence) REFERENCES feuille_presence(id_presence) ON DELETE CASCADE,
        FOREIGN KEY (id_participant) REFERENCES participant(id_participant) ON DELETE CASCADE,
        FOREIGN KEY (id_session) REFERENCES sessions(id_session) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    
    try {
      await db.query(createFeuillePresenceTable);
      await db.query(createParticipantTable);
      await db.query(createJointureTable);
      console.log('✅ Tables feuille de présence initialisées');
    } catch (error) {
      console.error('❌ Erreur création tables feuille de présence:', error);
      throw error;
    }
  }

  // Créer une feuille de présence
  async createFeuillePresence(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO feuille_presence (
          id_session, credit_impot, droit_tirage, mode_formation, 
          co_organisateurs, horaire_debut, horaire_fin, pause_debut, 
          pause_fin, entreprise_beneficiaire
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        data.id_session,
        data.credit_impot || false,
        data.droit_tirage || '',
        data.mode_formation || '',
        data.co_organisateurs || '',
        data.horaire_debut || null,
        data.horaire_fin || null,
        data.pause_debut || null,
        data.pause_fin || null,
        data.entreprise_beneficiaire || null
      ];

      console.log('📝 Création feuille de présence avec params:', params);
      
      db.query(query, params, (error, results) => {
        if (error) {
          console.error('❌ Erreur SQL createFeuillePresence:', error);
          return reject(error);
        }
        
        console.log('✅ Feuille de présence créée avec ID:', results.insertId);
        resolve(results.insertId);
      });
    });
  }

  // Trouver un participant par email ou le créer s'il n'existe pas
  async findOrCreateParticipant(participantData) {
    return new Promise((resolve, reject) => {
      const { CIN, nomComplet, mail, telephone, direction_service } = participantData;
      
      // D'abord, chercher le participant par email s'il est fourni
      let findQuery, findParams;
      
      if (mail) {
        findQuery = 'SELECT id_participant FROM participant WHERE mail = ?';
        findParams = [mail];
      } else {
        findQuery = 'SELECT id_participant FROM participant WHERE CIN = ?';
        findParams = [CIN];
      }
      
      db.query(findQuery, findParams, (error, results) => {
        if (error) {
          console.error('❌ Erreur recherche participant:', error);
          return reject(error);
        }
        
        if (results.length > 0) {
          console.log('✅ Participant trouvé avec ID:', results[0].id_participant);
          return resolve(results[0].id_participant);
        }
        
        // Si pas trouvé par email, chercher par CIN si on avait cherché par email
        if (mail) {
          db.query('SELECT id_participant FROM participant WHERE CIN = ?', [CIN], (errorCIN, resultsCIN) => {
            if (errorCIN) {
              console.error('❌ Erreur recherche participant par CIN:', errorCIN);
              return reject(errorCIN);
            }
            
            if (resultsCIN.length > 0) {
              console.log('✅ Participant trouvé par CIN avec ID:', resultsCIN[0].id_participant);
              return resolve(resultsCIN[0].id_participant);
            }
            
            // Créer nouveau participant
            this.createNewParticipant(nomComplet, mail, CIN, telephone, direction_service, resolve, reject);
          });
        } else {
          // Créer nouveau participant
          this.createNewParticipant(nomComplet, mail, CIN, telephone, direction_service, resolve, reject);
        }
      });
    });
  }

  // Méthode helper pour créer un nouveau participant
  createNewParticipant(nomComplet, mail, CIN, telephone, direction_service, resolve, reject) {
    const createQuery = `
      INSERT INTO participant (nom_complet, mail, CIN, telephone, direction_service) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const createParams = [
      nomComplet,
      mail || null,
      CIN,
      telephone || null,
      direction_service || null
    ];
    
    console.log('📝 Création nouveau participant:', createParams);
    
    db.query(createQuery, createParams, (createError, createResults) => {
      if (createError) {
        console.error('❌ Erreur création participant:', createError);
        return reject(createError);
      }
      
      console.log('✅ Nouveau participant créé avec ID:', createResults.insertId);
      resolve(createResults.insertId);
    });
  }

  // Créer la liaison entre feuille de présence et participant
  async createFeuillePresenceParticipant(data) {
    return new Promise((resolve, reject) => {
      const { id_presence, id_participant, id_session, emargement } = data;
      
      // Vérifier si la liaison existe déjà
      const checkQuery = `
        SELECT * FROM feuille_presence_participants 
        WHERE id_presence = ? AND id_participant = ? AND id_session = ?
      `;
      
      db.query(checkQuery, [id_presence, id_participant, id_session], (checkError, checkResults) => {
        if (checkError) {
          console.error('❌ Erreur vérification liaison:', checkError);
          return reject(checkError);
        }
        
        if (checkResults.length > 0) {
          console.log('⚠️ Liaison déjà existante, mise à jour de l\'émargement');
          
          // Mettre à jour l'émargement existant
          const updateQuery = `
            UPDATE feuille_presence_participants 
            SET emargement = ? 
            WHERE id_presence = ? AND id_participant = ? AND id_session = ?
          `;
          
          db.query(updateQuery, [emargement, id_presence, id_participant, id_session], (updateError, updateResults) => {
            if (updateError) {
              console.error('❌ Erreur mise à jour liaison:', updateError);
              return reject(updateError);
            }
            
            console.log('✅ Liaison mise à jour');
            resolve({ updated: true });
          });
        } else {
          // Créer nouvelle liaison
          const insertQuery = `
            INSERT INTO feuille_presence_participants 
            (id_presence, id_participant, id_session, emargement) 
            VALUES (?, ?, ?, ?)
          `;
          
          db.query(insertQuery, [id_presence, id_participant, id_session, emargement], (insertError, insertResults) => {
            if (insertError) {
              console.error('❌ Erreur création liaison:', insertError);
              return reject(insertError);
            }
            
            console.log('✅ Liaison participant-feuille créée');
            resolve({ created: true });
          });
        }
      });
    });
  }

  

  

}

module.exports = new FeuillePresenceRepository();
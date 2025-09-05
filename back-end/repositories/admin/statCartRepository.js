const db = require('../../connect');

class StatsRepository {
  async getAdminStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_admins,
          SUM(CASE WHEN id_acces != 4 THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN id_acces = 4 THEN 1 ELSE 0 END) as super_admins
        FROM admin
      `;
      
      db.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results[0]);
      });
    });
  }
getSessionsWithAvis(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT s.*, 
          CONCAT('[', GROUP_CONCAT(
            JSON_OBJECT(
              'id_avis', a.id_avis,
              'note', a.note,
              'commentaire', a.commentaire,
              'date_creation', a.date_creation,
              'participant', JSON_OBJECT(
                'id_participant', p.id_participant,
                'nom_complet', p.nom_complet
              )
            )
          ), ']') AS avis
        FROM session s
        LEFT JOIN avis a ON s.id_session = a.id_session
        LEFT JOIN participant p ON a.id_participant = p.id_participant
      `;

      const whereClauses = [];
      const params = [];

      // Filtres
      if (filters.formateur) {
        whereClauses.push('s.id_formateur = ?');
        params.push(filters.formateur);
      }

      if (filters.theme) {
        whereClauses.push('s.id_theme = ?');
        params.push(filters.theme);
      }

      if (filters.dateRange) {
        whereClauses.push('s.date_debut >= ? AND s.date_fin <= ?');
        params.push(filters.dateRange.start, filters.dateRange.end);
      }

      if (filters.minRating) {
        whereClauses.push('a.note >= ?');
        params.push(filters.minRating);
      }

      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      query += ' GROUP BY s.id_session LIMIT 0, 25';

      db.query(query, params, (error, results) => {
        if (error) {
          reject(new Error(`Database error: ${error.message}`));
          return;
        }

        try {
          const formattedResults = results.map(row => ({
            ...row,
            avis: row.avis ? JSON.parse(row.avis) : []
          }));
          resolve(formattedResults);
        } catch (parseError) {
          reject(new Error(`Data parsing error: ${parseError.message}`));
        }
      });
    });
  }

  getSessionById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          s.*, 
          f.nom_complet AS formateur_nom,
          t.theme,
          CONCAT('[', GROUP_CONCAT(
            JSON_OBJECT(
              'id_avis', a.id_avis,
              'note', a.note,
              'commentaire', a.commentaire,
              'date_creation', a.date_creation
            )
          ), ']') AS avis
        FROM session s
        LEFT JOIN formateur f ON s.id_formateur = f.id_formateur
        LEFT JOIN theme t ON s.id_theme = t.id_theme
        LEFT JOIN avis a ON s.id_session = a.id_session
        WHERE s.id_session = ?
        GROUP BY s.id_session
        LIMIT 0, 25
      `;

      db.query(query, [id], (error, results) => {
        if (error) {
          reject(new Error(`Database error: ${error.message}`));
          return;
        }

        if (results.length === 0) {
          resolve(null);
          return;
        }

        try {
          const sessionData = {
            ...results[0],
            avis: results[0].avis ? JSON.parse(results[0].avis) : [],
            formateur: {
              id_formateur: results[0].id_formateur,
              nom_complet: results[0].formateur_nom
            },
            theme: {
              id_theme: results[0].id_theme,
              nom_theme: results[0].theme
            }
          };
          resolve(sessionData);
        } catch (parseError) {
          reject(new Error(`Data parsing error: ${parseError.message}`));
        }
      });
    });
  }

  getAvisBySession(sessionId, minRating = 0) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*, 
               p.nom_complet as participant_nom
        FROM avis a
        JOIN participant p ON a.id_participant = p.id_participant
        WHERE a.id_session = ?
      `;

      const params = [sessionId];

      if (minRating > 0) {
        query += ' AND a.note >= ?';
        params.push(minRating);
      }

      db.query(query, params, (error, results) => {
        if (error) {
          reject(new Error(`Database error: ${error.message}`));
          return;
        }

        try {
          const formattedResults = results.map(row => ({
            ...row,
            participant: {
              id_participant: row.id_participant,
              nom_complet: row.participant_nom
            },
            criteres: row.criteres ? JSON.parse(row.criteres) : null
          }));
          resolve(formattedResults);
        } catch (parseError) {
          reject(new Error(`Data parsing error: ${parseError.message}`));
        }
      });
    });
  }

  getAverageRatingsBySession(sessionIds) {
    return new Promise((resolve, reject) => {
      if (!sessionIds || sessionIds.length === 0) {
        resolve({});
        return;
      }

      const query = `
        SELECT 
          id_session,
          AVG(note) as average_note,
          COUNT(id_avis) as count
        FROM avis
        WHERE id_session IN (?)
        GROUP BY id_session
      `;

      db.query(query, [sessionIds], (error, results) => {
        if (error) {
          reject(new Error(`Database error: ${error.message}`));
          return;
        }

        const ratingsMap = results.reduce((acc, row) => {
          acc[row.id_session] = {
            average: parseFloat(row.average_note) || 0,
            count: row.count
          };
          return acc;
        }, {});

        resolve(ratingsMap);
      });
    });
  }

  getEvaluationStats() {
    return new Promise((resolve, reject) => {
      // Première requête pour les statistiques générales
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT id_session) as total_sessions,
          COUNT(id_avis) as total_evaluations,
          AVG(note) as average_rating
        FROM avis
      `;

      // Deuxième requête pour les statistiques par critère
      const criteriaQuery = `
        SELECT  
          COUNT(id_avis) as count,
          AVG(CASE adaptation_programme_vie_pro
              WHEN 'Insuffisant' THEN 1
              WHEN 'Peu satisfaisant' THEN 2
              WHEN 'Satisfaisant' THEN 3
              WHEN 'Très satisfaisant' THEN 4
              ELSE NULL END) as adaptation,
          /* ... autres critères ... */
          AVG(CASE duree_formation
              WHEN 'Insuffisant' THEN 1
              WHEN 'Peu satisfaisant' THEN 2
              WHEN 'Satisfaisant' THEN 3
              WHEN 'Très satisfaisant' THEN 4
              ELSE NULL END) as duree
        FROM avis
      `;

      // Exécution des deux requêtes en parallèle
      db.query(statsQuery, (statsError, statsResults) => {
        if (statsError) {
          reject(new Error(`Stats query error: ${statsError.message}`));
          return;
        }

        db.query(criteriaQuery, (criteriaError, criteriaResults) => {
          if (criteriaError) {
            reject(new Error(`Criteria query error: ${criteriaError.message}`));
            return;
          }

          try {
            const stats = statsResults[0] || {};
            const criteria = criteriaResults[0] || {};

            resolve({
              totalSessions: stats.total_sessions || 0,
              totalEvaluations: stats.total_evaluations || 0,
              averageRating: parseFloat(stats.average_rating) || 0,
              criteriaStats: {
                adaptation_programme_vie_pro: parseFloat(criteria.adaptation) || 0,
                /* ... autres critères ... */
                duree_formation: parseFloat(criteria.duree) || 0
              }
            });
          } catch (parseError) {
            reject(new Error(`Data parsing error: ${parseError.message}`));
          }
        });
      });
    });
  }
getMoyenneNotesParSession() {
  const query = `
    SELECT 
      s.id_session,
      f.nom_complet AS formateur,
      t.theme AS theme,
      COUNT(a.id_avis) AS nombre_avis,
      AVG(a.note) AS moyenne_notes,
      MIN(a.note) AS note_min,
      MAX(a.note) AS note_max
    FROM 
      session s
    JOIN 
      avis a ON s.id_session = a.id_session
    JOIN 
      formateur f ON s.id_formateur = f.id_formateur
    JOIN 
      theme t ON s.id_theme = t.id_theme
    GROUP BY 
      s.id_session, f.nom_complet, t.theme
    ORDER BY 
      moyenne_notes DESC
  `;
  
  return new Promise((resolve, reject) => {
    db.query(query, (error, results, fields) => {
      if (error) {
        console.error('Erreur SQL:', error);
        reject(new Error('Erreur de base de données'));
        return;
      }
      
      try {
        const formatted = results.map(row => ({
          id_session: row.id_session,
          formateur: row.formateur,
          theme: row.theme,
          nombre_avis: row.nombre_avis,
          moyenne_notes: parseFloat(row.moyenne_notes).toFixed(2),
          note_min: parseFloat(row.note_min).toFixed(1),
          note_max: parseFloat(row.note_max).toFixed(1)
        }));
        resolve(formatted);
      } catch (mapError) {
        console.error('Erreur de formatage:', mapError);
        reject(new Error('Erreur de traitement des données'));
      }
    });
  });
}
async getCommentsByTheme(themeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.id_avis,
          a.commentaire,
          a.note,
          DATE_FORMAT(a.date_creation, '%Y-%m-%d') as date_creation,
          p.nom_complet as participant_nom,
          s.id_session,
          DATE_FORMAT(s.date_debut, '%Y-%m-%d') as date_debut,
          DATE_FORMAT(s.date_fin, '%Y-%m-%d') as date_fin,
          f.nom_complet as formateur_nom
        FROM 
          avis a
        JOIN 
          session s ON a.id_session = s.id_session
        JOIN 
          participant p ON a.id_participant = p.id_participant
        JOIN 
          formateur f ON s.id_formateur = f.id_formateur
        WHERE 
          s.id_theme = ?
        ORDER BY 
          a.date_creation DESC
      `;

      db.query(query, [themeId], (error, results) => {
        if (error) {
          reject(new Error(`Database error: ${error.message}`));
          return;
        }

        const averageRating = results.length > 0 
          ? results.reduce((sum, avis) => sum + avis.note, 0) / results.length
          : 0;

        resolve({
          comments: results,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalComments: results.length
        });
      });
    });
  }

async getSessionStatusStats() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN etat = 'Deja Realise' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN etat = 'A Realiser' THEN 1 ELSE 0 END) as pending_count,
        ROUND(SUM(CASE WHEN etat = 'Deja Realise' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as completed_percentage,
        ROUND(SUM(CASE WHEN etat = 'A Realiser' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pending_percentage
      FROM 
        session
      WHERE 
        etat IN ('A Réalisé', 'Déja Réalisé')
    `;

    db.query(query, (error, results) => {
      if (error) {
        reject(new Error(`Database error: ${error.message}`));
        return;
      }

      if (results.length === 0) {
        resolve({
          total: 0,
          completed: { count: 0, percentage: 0 },
          pending: { count: 0, percentage: 0 }
        });
        return;
      }

      const row = results[0];
      const stats = {
        total: row.total_sessions,
        completed: {
          count: row.completed_count,
          percentage: parseFloat(row.completed_percentage)
        },
        pending: {
          count: row.pending_count,
          percentage: parseFloat(row.pending_percentage)
        }
      };

      resolve(stats);
    });
  });
}
/*
  async getSessionStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          id_cal,
          COUNT(*) AS nombre_sessions,
          GROUP_CONCAT(mois ORDER BY id SEPARATOR ', ') AS mois_concaténés
        FROM calendrierformation
        WHERE id_domaine IS NOT NULL AND date_debut IS NOT NULL
        GROUP BY id_cal
        ORDER BY id_cal
      `;
      
      db.query(query, (error, results) => {
        if (error) return reject(error);
        resolve(results);
      });
    });
  }*/
}

module.exports = new StatsRepository();
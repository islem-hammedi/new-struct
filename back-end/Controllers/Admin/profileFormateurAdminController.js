const db = require('../../connect');  
const bcrypt = require('bcrypt');

const getFormateurDetails = (req, res) => {
    const { id_formateur } = req.params;

    const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
    db.query(query, [id_formateur], (err, result) => {
      if (err) {
        console.error("Error fetching formateur:", err); 
        return res.status(500).json({ error: err.message });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: 'Formateur not found' });
      }
      const formateur = result[0];
  
      const fichePrgQuery = 'SELECT id_fichePrg, chemin  FROM fiche_prg WHERE id_formateur = ?';
      db.query(fichePrgQuery, [id_formateur], (err, ficheResults) => {
        if (err) {
          console.error("Error fetching fiches programme:", err);
          return res.status(500).json({ error: err.message });
        }
  
        // Ajouter les fiches programme au formateur
        formateur.fichePrg = ficheResults.map(fiche => ({
          ...fiche,
          fichier_pdf: fiche.fichier_pdf ? `${process.env.BASE_URL}/uploads/${fiche.fichier_pdf}` : null
      }));

        return res.json(formateur);
      });
    });
  };
  
  
const getFormationsARealiser = (req, res) => {
    const { id_formateur } = req.params;

    if (!id_formateur) {
        return res.status(400).json({ error: 'ID formateur est requis.' });
    }

    const query = `
        SELECT 
            s.id_session, 
            s.theme, 
            s.code, 
            f.domaine, 
            s.duree, 
            s.date_debut, 
            s.date_fin, 
            s.etat, 
            s.type_session, 
            fp.chemin AS fiche_prg  
        FROM session s
        JOIN formation f ON s.id_formation = f.id_formation
        JOIN formateur frm ON s.id_formateur = frm.id_formateur
        LEFT JOIN fiche_prg fp ON frm.id_formateur = fp.id_formateur 
        WHERE s.etat = 'à réaliser' 
          AND frm.id_formateur = ?; `

    db.query(query, [id_formateur], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des sessions :', error);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucune formation à réaliser trouvée.' });
        }

        res.json(results);
    });
};


const getHistoriqueFormations = (req, res) => {
  const { id_formateur } = req.params;

  if (!id_formateur) {
      return res.status(400).json({ error: 'ID formateur est requis.' });
  }

  const query = `
     SELECT 
          s.id_session, 
          s.theme, 
          s.code, 
          f.domaine, 
          s.duree, 
          s.date_debut, 
          s.date_fin, 
          s.etat, 
          s.type_session, 
          fp.chemin AS fiche_prg,  
          a.id_avis,            
          a.fichier_pdf AS avis_pdf,  
          a.date_creation AS date_avis  
      FROM session s
      JOIN formation f ON s.id_formation = f.id_formation
      JOIN formateur frm ON s.id_formateur = frm.id_formateur
      LEFT JOIN fiche_prg fp ON frm.id_formateur = fp.id_formateur  
      LEFT JOIN avis a ON s.id_session = a.id_session  
      WHERE s.etat = 'déjà réalisé' 
        AND frm.id_formateur = ?;`;

  db.query(query, [id_formateur], (error, results) => {
      if (error) {
          console.error('Erreur lors de la récupération des formations réalisées :', error);
          return res.status(500).json({ error: 'Erreur serveur lors de la récupération des formations.' });
      }
      if (results.length === 0) {
          return res.status(404).json({ message: 'Aucune formation historique trouvée.' });
      }

      // Pour chaque session, vérifier s'il y a des fichiers à renvoyer
      results.forEach(session => {
        // Préparer les URLs des fichiers PDF
        session.fiche_prg = session.fiche_prg ? `${process.env.BASE_URL}/uploads/${session.fiche_prg}` : null;
        session.avis_pdf = session.avis_pdf ? `${process.env.BASE_URL}/uploads/${session.avis_pdf}` : null;
      });
      res.status(200).json(results); 
    });
};

const updatePassword = (req, res) => {
    const { id_formateur } = req.params;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        return res.status(400).json({ error: 'Les champs mot de passe actuel et nouveau mot de passe sont requis.' });
    }

    const query = 'SELECT mdp_formateur FROM formateur WHERE id_formateur = ?';
    
    db.query(query, [id_formateur], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération du mot de passe :', error);
            return res.status(500).json({ error: 'Erreur serveur lors de la récupération du mot de passe.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Formateur non trouvé.' });
        }

        const storedPassword = results[0].mdp_formateur;

        bcrypt.compare(old_password, storedPassword, (err, isMatch) => {
            if (err) {
                console.error('Erreur lors de la vérification du mot de passe :', err);
                return res.status(500).json({ error: 'Erreur serveur lors de la vérification du mot de passe.' });
            }

            if (!isMatch) {
                return res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
            }

            bcrypt.hash(new_password, 10, (hashError, hashedPassword) => {
                if (hashError) {
                    console.error('Erreur lors du hachage du mot de passe :', hashError);
                    return res.status(500).json({ error: 'Erreur serveur lors du hachage du mot de passe.' });
                }

                const updateQuery = 'UPDATE formateur SET mdp_formateur = ? WHERE id_formateur = ?';
                
                db.query(updateQuery, [hashedPassword, id_formateur], (updateError, updateResults) => {
                    if (updateError) {
                        console.error('Erreur lors de la mise à jour du mot de passe :', updateError);
                        return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du mot de passe.' });
                    }

                    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
                });
            });
        });
    });   
};
const getEvents = (req, res) => {
  const { nom_complet } = req.user; 
  console.log(nom_complet);
  db.query(
      'SELECT id, title, date, created_by FROM calendrier WHERE created_by = ?',
      [nom_complet],
      (err, results) => {
          if (err) {
              console.error('Erreur lors de la récupération des événements :', err);
              return res.status(500).json({ error: 'Erreur serveur' });
          }
          res.status(200).json(results);
      }
  );
};

  
  const createEvent = (req, res) => {
    const { title, date, created_by } = req.body;
  
    if (!title || !date || !created_by) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const sql = "INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?)";
    db.query(sql, [title, date, created_by], (err, result) => {
      if (err) {
        console.error('Database Error:', err);
        return res.status(500).json({ error: 'Erreur serveur', details: err.message });
      }
      const newEvent = {
        id: result.insertId,
        title,
        date,
        created_by,
      };
      res.status(201).json(newEvent);
    });
  };
  const deleteEvent = (req, res) => {

    const { id } = req.params;
    const createdBy = req.user.nom_complet; 
  
    db.query('DELETE FROM calendrier WHERE id = ? AND created_by = ?', [id, createdBy], (err, results) => {
        if (err) {
        console.error('Erreur lors de la suppression de l\'événement :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres événements' });
      }
  
      res.status(200).json({ message: 'Événement supprimé avec succès' });
    });
  };
  
 
module.exports = { 
    getFormateurDetails, 
    getFormationsARealiser, 
    getHistoriqueFormations,
    updatePassword,
    getEvents, createEvent, deleteEvent
};

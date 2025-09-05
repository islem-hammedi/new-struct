const db = require('../../connect');
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

const getFormateurs = (req, res) => {
    const query = 'SELECT * FROM formateur';
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching formateurs:", err);  // Log l'erreur pour aider au débogage
        return res.status(500).json({ error: err.message });
      }
      return res.json(results);
    });
  };
const getFormateurById = (req, res) => {
  const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Formateur not found' });
    return res.json(result[0]);
  });
};


const updateFormateur = (req, res) => {
  const id = req.params.id;

  const { nom_complet, mail, adr, competences, themes_a_enseigner, tarif_journalier, nb_formations, tel } = req.body;

  if (!id || !nom_complet || !mail || !adr || !competences || !themes_a_enseigner || !tarif_journalier || !nb_formations || !tel) {
    return res.status(400).json({ error: 'Tous les champs doivent être remplis' });
  }

  const query = `
    UPDATE formateur 
    SET 
      nom_complet = ?, 
      mail = ?, 
      adr = ?, 
      competences = ?, 
      themes_a_enseigner = ?, 
      tarif_journalier = ?, 
      nb_formations = ?, 
      tel = ? 
    WHERE id_formateur = ?
  `;

  db.query(
    query,
    [nom_complet, mail, adr, competences, themes_a_enseigner, tarif_journalier, nb_formations, tel, id],
    (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du formateur:', err);
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Formateur mis à jour avec succès' });
    }
  );
};


const deleteFormateur = (req, res) => {
  const formateurId = req.params.id;  // Récupère l'ID depuis les paramètres d'URL
  const query = 'DELETE FROM formateur WHERE id_formateur = ?';
  
  db.query(query, [formateurId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Vérifie si un formateur a été supprimé
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Formateur non trouvé' });
    }

    return res.json({ message: 'Formateur deleted successfully' });
  });
};


const addFormateur = (req, res) => {
  const { nom_complet, mail, adr, competences, themes_a_enseigner, tarif_journalier, nb_formations, tel, photo } = req.body;

  if (!nom_complet || !mail) {
    return res.status(400).json({ error: "Les champs 'nom_complet' et 'mail' sont obligatoires." });
  }

  const query = `INSERT INTO formateur 
    (nom_complet, mail, adr, competences, themes_a_enseigner, tarif_journalier, nb_formations, tel, photo) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query, 
    [nom_complet, mail, adr, competences, themes_a_enseigner, tarif_journalier, nb_formations, tel, photo], 
    (err, result) => {
      if (err) {
        console.error("Erreur SQL:", err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Formateur ajouté avec succès', id: result.insertId });
    }
  );
};


module.exports = {
    getFormateurs,
  getFormateurById,
  addFormateur,
  updateFormateur,
  deleteFormateur,
};
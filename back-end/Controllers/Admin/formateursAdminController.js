{/*const db = require('../../connect');
const path = require('path');
const fs = require('fs'); 
const bcrypt = require('bcrypt');
const pdf2json = require("pdf2json");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const pdfParse =require('pdf-parse');


const getFormateurs = (req, res) => {
  const query = 'SELECT * FROM formateur';
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching formateurs:", err);
      return res.status(500).json({ error: err.message });
    }

    const formateursWithFichesAndCours = [];
    let processedFormateurs = 0;

    results.forEach(formateur => {
      const fichePrgQuery = 'SELECT fiche_prg FROM session WHERE id_formateur = ?';
      const coursSessionQuery = 'SELECT cours_session FROM session WHERE id_formateur = ?'; 
      db.query(fichePrgQuery, [formateur.id_formateur], (err, ficheResults) => {
        if (err) {
          console.error("Error fetching fiches programme:", err);
          return res.status(500).json({ error: err.message });
        }

        // Requête pour obtenir les sessions de cours liées à ce formateur
        db.query(coursSessionQuery, [formateur.id_formateur], (err, coursResults) => {
          if (err) {
            console.error("Error fetching cours sessions:", err);
            return res.status(500).json({ error: err.message });
          }

          formateur.fichePrg = ficheResults;
          formateur.coursSession = coursResults; 
          formateursWithFichesAndCours.push(formateur);
          processedFormateurs++;

          if (processedFormateurs === results.length) {
            return res.json(formateursWithFichesAndCours);
          }
        });
      });
    });
  });
};

const getFormateurById = (req, res) => {
  const formateurId = req.params.id;

  const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
  db.query(query, [formateurId], (err, result) => {
    if (err) {
      console.error("Error fetching formateur:", err);  // Log l'erreur pour aider au débogage
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Formateur not found' });
    }

    const formateur = result[0];
    console.log(formateur.cv); 

    // Requête pour obtenir les fiches programme et les sessions de cours liées à ce formateur
    const fichePrgQuery = 'SELECT fiche_prg FROM session WHERE id_formateur = ?';
    const coursSessionQuery = 'SELECT cours_session FROM session WHERE id_formateur = ?'; // Nouvelle requête pour les cours de session

    // Récupération des fiches programme
    db.query(fichePrgQuery, [formateurId], (err, ficheResults) => {
      if (err) {
        console.error("Error fetching fiches programme:", err);
        return res.status(500).json({ error: err.message });
      }

      // Récupération des sessions de cours
      db.query(coursSessionQuery, [formateurId], (err, coursResults) => {
        if (err) {
          console.error("Error fetching cours sessions:", err);
          return res.status(500).json({ error: err.message });
        }

        // Ajouter les fiches programme et les sessions de cours au formateur
        formateur.fichePrg = ficheResults;
        formateur.coursSession = coursResults; 

        return res.json(formateur);
      });
    });
  });
};
const updateFormateur = (req, res) => {
  const id = req.params.id;
  let coursSession = [];
  let fichePrg = [];
  let cv = null;

  // Lire les fichiers si disponibles
  if (req.files?.coursSession) {
    coursSession = req.files.coursSession.map(file => file.filename);
  }
  if (req.files?.fichePrg) {
    fichePrg = req.files.fichePrg.map(file => file.filename);
  }

  // Si un CV est téléchargé, le mettre à jour, sinon garder l'ancien
  if (req.files?.cv) {
    cv = req.files.cv[0].filename;
  }

  const { 
    nom_complet, mail, adr, domaine_de_competences, themes_a_enseigner, 
    tarif_journalier, nb_formations, tel, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting, deleteFiches 
  } = req.body;

  // Récupérer l'ancien CV si nécessaire
  const getCurrentCvQuery = 'SELECT cv FROM formateur WHERE id_formateur = ?';
  db.query(getCurrentCvQuery, [id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'ancien CV:', err);
      return res.status(500).json({ error: err.message });
    }

    // Si aucun CV n'est téléchargé, garder l'ancien CV
    if (!cv && result.length > 0) {
      cv = result[0].cv;
    }

    const domaineCompetencesString = domaine_de_competences 
      ? (typeof domaine_de_competences === 'string' ? domaine_de_competences : JSON.stringify(domaine_de_competences))
      : '[]';

    const themesAEnseignerString = themes_a_enseigner 
      ? (typeof themes_a_enseigner === 'string' ? themes_a_enseigner : JSON.stringify(themes_a_enseigner))
      : '[]';

    const updates = {
      nom_complet, mail, adr, domaine_de_competences: domaineCompetencesString, 
      themes_a_enseigner: themesAEnseignerString, 
      tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
      nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting
    };

    // Construction dynamique de la requête UPDATE
    const fields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates).filter(value => value !== undefined).concat(id);

    if (!fields) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    const query = `UPDATE formateur SET ${fields} WHERE id_formateur = ?;`;
    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Erreur lors de la mise à jour du formateur:', err);
        return res.status(500).json({ error: err.message });
      }
      return res.json({ message: 'Formateur mis à jour avec succès' });
    });
  });
};




const deleteFormateur = (req, res) => {
  const formateurId = req.params.id; // Récupère l'ID du formateur

  // Requête pour récupérer les fichiers du formateur
  const getFormateurQuery = 'SELECT cv FROM formateur WHERE id_formateur = ?';

  db.query(getFormateurQuery, [formateurId], (err, formateurResults) => {
    if (err) {
      return res.status(500).json({ error: "Erreur lors de la récupération des fichiers du formateur: " + err.message });
    }

    if (formateurResults.length === 0) {
      return res.status(404).json({ message: "Formateur non trouvé" });
    }

    const formateur = formateurResults[0];

    // Supprimer les fichiers associés (CV, fiches programme, cours session)
    if (formateur.cv) {
      const cvPath = path.join(__dirname, '../..', 'uploads', formateur.cv);
      fs.unlink(cvPath, (err) => {
        if (err) console.error("Erreur de suppression du CV:", err);
      });
    }   

        // Supprimer le formateur
  const deleteFormateurQuery = 'DELETE FROM formateur WHERE id_formateur = ?';
        db.query(deleteFormateurQuery, [formateurId], (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Formateur non trouvé' });
          }

          return res.json({ message: 'Formateur et fichiers associés supprimés avec succès' });
        });
      });
    
  
};

const addFormateur = (req, res) => {
  const { nom_complet, mail, adr, domaine_de_competences, themes_a_enseigner, 
    tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting 
  } = req.body;
  if (!nom_complet || !mail || !mdp_formateur) {
    return res.status(400).json({ error: "Les champs 'nom_complet', 'mail' et 'mdp_formateur' sont obligatoires." });
  }

const domaineCompetencesString = domaine_de_competences 
? (typeof domaine_de_competences === 'string' ? domaine_de_competences : JSON.stringify(domaine_de_competences))
: '[]';

const themesAEnseignerString = themes_a_enseigner 
? (typeof themes_a_enseigner === 'string' ? themes_a_enseigner : JSON.stringify(themes_a_enseigner))
: '[]';
  bcrypt.hash(mdp_formateur, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Erreur de hachage du mot de passe:", err);
      return res.status(500).json({ error: "Erreur de sécurité lors de la création du mot de passe." });
    }

    const cvPath = req.files?.cv ? req.files.cv[0].filename : undefined;

    const queryFormateur = `INSERT INTO formateur (nom_complet, mail, adr, domaine_de_competences, 
    themes_a_enseigner, tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, 
    nb_experience, horraire_jour, nom_banque, RIB, domaine_assistance, retour_sacConsulting) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      queryFormateur,
      [nom_complet, mail, adr, domaineCompetencesString, themesAEnseignerString, tarif_journalier,
        nb_formations, tel, cvPath, hashedPassword, niveau_etude, nb_experience, horraire_jour, nom_banque,
        RIB, domaine_assistance, retour_sacConsulting],
      (err, result) => {
        if (err) {
          console.error("Erreur SQL:", err);
          return res.status(500).json({ error: err.message });
        }

        const formateurId = result.insertId;
        let insertions = []; 
  },
        Promise.all(insertions)
          .then(() => res.status(201).json({ message: "Formateur et cv ajoutés avec succès", id: formateurId }))
          .catch(errorMsg => res.status(500).json({ error: errorMsg })));
      }
    );
  ;
};


const getDomaineThemes = async (req, res) => {
  const query = `
    SELECT d.domaine, t.theme 
    FROM domaine d 
    JOIN theme t ON d.id_domaine = t.id_domaine
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).send('Erreur lors de la récupération des domaines et thèmes');
    }
  
  
    const domainesThemes = results.reduce((acc, item) => {
      if (!acc[item.domaine]) {
        acc[item.domaine] = [];
      }
      acc[item.domaine].push(item.theme);
      return acc;
    }, {});
    
    res.json(domainesThemes);
  });
  
};

module.exports = {
    getFormateurs,
  getFormateurById,
  addFormateur,
  updateFormateur,
  deleteFormateur,
  getDomaineThemes
 
};
*/}












const FormateurService = require('../../services/admin/formateur');

const getFormateurs = async (req, res) => {
  try {
    const formateurs = await FormateurService.getAllFormateurs();
    return res.json(formateurs);
  } catch (err) {
    console.error("Error fetching formateurs:", err);
    return res.status(500).json({ error: err.message });
  }
};

const getFormateurById = async (req, res) => {
  const { id } = req.params;
  try {
    const formateur = await FormateurService.getFormateurById(id);
    return res.json(formateur);
  } catch (err) {
    console.error("Error fetching formateur:", err);
    if (err.message === 'Formateur not found') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

const updateFormateur = async (req, res) => {
  const id = req.params.id;
  const updates = req.body; 
  let cv = null;

  if (req.files?.cv) {
    cv = req.files.cv[0].filename;
  }

  try {
    const result = await FormateurService.updateFormateur(id, updates, cv);
    res.json(result);
    console.log('updates',updates);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteFormateur = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await FormateurService.deleteFormateur(id);
    res.json(result);
  } catch (err) {
    console.error('Erreur lors de la suppression du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const addFormateur = async (req, res) => {
  const data = req.body;
  const cv = req.files?.cv ? req.files.cv[0].filename : undefined;

  if (!data.nom_complet || !data.mail || !data.mdp_formateur) {
    return res
      .status(400)
      .json({ error: "Les champs 'nom_complet', 'mail' et 'mdp_formateur' sont obligatoires." });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.mdp_formateur, 10);
    const result = await FormateurService.addFormateur(data, cv, hashedPassword);
    res.status(201).json(result);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const getDomaineThemes = async (req, res) => {
  try {
    const domainesThemes = await FormateurService.getDomaineThemes();
    res.json(domainesThemes);
  } catch (err) {
    console.error('Erreur lors de la récupération des domaines et thèmes:', err);
    res.status(500).send('Erreur lors de la récupération des domaines et thèmes');
  }
};


module.exports = {
  getFormateurs,
  getFormateurById,getDomaineThemes,addFormateur,updateFormateur,deleteFormateur
};
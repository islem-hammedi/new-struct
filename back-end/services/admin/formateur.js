{/*
const Formateur = require('../../models/admin/formateur');
const formateurRepository = require('../../repositories/admin/formateur');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const getAllFormateurs = (callback) => {
  formateurRepository.findAllFormateurs((error, formateursData) => {
    if (error) return callback(error);
    
    const formateursWithFiles = [];
    let processed = 0;
    
    if (formateursData.length === 0) return callback(null, []);
    
    formateursData.forEach(formateur => {
      formateurRepository.getFormateurFiles(formateur.id_formateur, (err, files) => {
        if (err) return callback(err);
        
        const formateurObj = new Formateur({
          ...formateur,
          fichePrg: files.fiches,
          coursSession: files.cours
        });
        
        formateursWithFiles.push(formateurObj);
        processed++;
        
        if (processed === formateursData.length) {
          callback(null, formateursWithFiles);
        }
      });
    });
  });
};

const getFormateurById = (id, callback) => {
  formateurRepository.findFormateurById(id, (error, formateurData) => {
    if (error) return callback(error);
    if (!formateurData) return callback(null, null);
    
    formateurRepository.getFormateurFiles(id, (err, files) => {
      if (err) return callback(err);
      
      const formateur = new Formateur({
        ...formateurData,
        fichePrg: files.fiches,
        coursSession: files.cours
      });
      
      callback(null, formateur);
    });
  });
};

const createFormateur = (formateurData, files, callback) => {
  // Validation des champs obligatoires
  if (!formateurData.nom_complet || !formateurData.mail || !formateurData.mdp_formateur) {
    return callback(new Error("Les champs 'nom_complet', 'mail' et 'mdp_formateur' sont obligatoires"));
  }

  bcrypt.hash(formateurData.mdp_formateur, 10, (err, hashedPassword) => {
    if (err) return callback(err);
    
    formateurData.mdp_formateur = hashedPassword;
    formateurData.cv = files?.cv?.[0]?.filename;
    
    formateurRepository.createFormateur(formateurData, (error, formateurId) => {
      if (error) return callback(error);
      
      // Gestion des fichiers
      const fichePrgPath = files?.fichePrg?.[0]?.filename;
      const coursPath = files?.coursSession?.[0]?.filename;
      
      const insertions = [];
      
      if (fichePrgPath) {
        insertions.push((cb) => {
          formateurRepository.addFicheProgramme(formateurId, fichePrgPath, cb);
        });
      }
      
      if (coursPath) {
        insertions.push((cb) => {
          formateurRepository.addCoursSession(formateurId, coursPath, cb);
        });
      }
      
      if (insertions.length === 0) {
        return callback(null, { id: formateurId });
      }
      
      // Exécuter toutes les insertions en série
      const executeInsertions = (index) => {
        if (index >= insertions.length) {
          return callback(null, { id: formateurId });
        }
        
        insertions[index]((err) => {
          if (err) return callback(err);
          executeInsertions(index + 1);
        });
      };
      
      executeInsertions(0);
    });
  });
};


const updateFormateur = async (id, formateurData, files) => {
  try {
    // Gestion des fichiers
    if (files?.cv) {
      formateurData.cv = files.cv[0].filename;
    }
    if (files?.fichePrg) {
      await formateurRepository.updateFichesProgramme(id, files.fichePrg.map(f => f.filename));
    }
    if (files?.coursSession) {
      await formateurRepository.updateCoursSession(id, files.coursSession.map(f => f.filename));
    }

    // Mise à jour du formateur
    await formateurRepository.updateFormateur(id, formateurData);
    return { id };
  } catch (error) {
    throw { message: error.message || "Erreur lors de la mise à jour du formateur", details: error, statusCode: error.statusCode || 500 };
  }
};

const deleteFormateur = async (id) => {
  try {
    // Récupération des fichiers à supprimer
    const formateurFiles = await formateurRepository.getFormateurFiles(id);
    
    // Suppression physique des fichiers
    if (formateurFiles.cv) {
      const cvPath = path.join(__dirname, '../../../uploads', formateurFiles.cv);
      fs.unlinkSync(cvPath);
    }

    // Suppression en base de données
    await formateurRepository.deleteFormateur(id);
  } catch (error) {
    throw { message: error.message || "Erreur lors de la suppression du formateur", details: error, statusCode: error.statusCode || 500 };
  }
};

const extractPDFContent = async (formateurId, searchTerm) => {
  try {
    if (!formateurId || !searchTerm) {
      throw { message: "ID du formateur et terme de recherche requis", statusCode: 400 };
    }

    const pdfPaths = await formateurRepository.getFormateurPDFPaths(formateurId);
    if (!pdfPaths.length) {
      throw { message: "Aucun fichier PDF trouvé pour ce formateur", statusCode: 404 };
    }

    const texts = await Promise.all(
      pdfPaths.map(async (filePath) => {
        try {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          return pdfData.text;
        } catch (err) {
          console.error(`Erreur lors du traitement du fichier PDF: ${filePath}`, err);
          return '';
        }
      })
    );

    const combinedText = texts.join(" ").toLowerCase();
    const searchTermNormalized = searchTerm.toLowerCase();
    const contentMatch = combinedText.includes(searchTermNormalized);

    return {
      message: contentMatch ? "Mot-clé trouvé dans le PDF" : "Mot-clé non trouvé dans le PDF",
      content: contentMatch ? combinedText : undefined
    };
  } catch (error) {
    throw { message: error.message || "Erreur lors de l'extraction du contenu PDF", details: error, statusCode: error.statusCode || 500 };
  }
};

const getDomaineThemes = async () => {
  try {
    return await formateurRepository.getDomaineThemes();
  } catch (error) {
    throw { message: "Erreur lors de la récupération des domaines et thèmes", details: error, statusCode: 500 };
  }
};

module.exports = {
  getAllFormateurs,
  getFormateurById,
  createFormateur,
  updateFormateur,
  deleteFormateur,
  extractPDFContent,
  getDomaineThemes
};*/}
const Formateur = require('../../models/admin/formateur');
const formateurRepository = require('../../repositories/admin/formateur');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

exports.getAllFormateurs = async () => {
  try {
    const formateurs = await formateurRepository.findAllFormateurs();
    // Tri par id décroissant comme dans le frontend
    return formateurs.sort((a, b) => b.id_formateur - a.id_formateur);
  } catch (error) {
    console.error('Error in getAllFormateurs service:', error);
    throw error;
  }
};

exports.extractPdfContent = async (formateurId, searchTerm) => {
  try {
    const pdfPaths = await formateurRepository.getFormateurPdfPaths(formateurId);
    
    let combinedText = "";
    for (const filePath of pdfPaths) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        combinedText += pdfData.text + " ";
      } catch (err) {
        console.error(`Error processing PDF: ${filePath}`, err);
      }
    }

    return {
      content: combinedText.toLowerCase().includes(searchTerm.toLowerCase()) 
        ? combinedText 
        : ""
    };
  } catch (error) {
    console.error('Error in extractPdfContent service:', error);
    throw error;
  }
};

exports.deleteFormateur = async (id) => {
  try {
    // Suppression des fichiers associés
    const files = await formateurRepository.getFormateurFiles(id);
    if (files.cv) {
      const cvPath = path.join(__dirname, '../../../uploads', files.cv);
      fs.unlinkSync(cvPath);
    }
    
    // Suppression en base
    await formateurRepository.deleteFormateur(id);
  } catch (error) {
    console.error('Error in deleteFormateur service:', error);
    throw error;
  }
};
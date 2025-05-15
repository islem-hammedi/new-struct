import React, { useEffect, useState } from "react";
import axios from "axios";

interface Formateur {
  id_formateur: number;
  nom_complet: string;
  rang?: number;
}

interface Session {
  id_theme: number;
  theme: string;
  formateurs: Formateur[];
}

interface Domaine {
  domaine: string;
  id_formation: number;
  sessions: Session[];
}

interface EditThemesProps {
  domaineId: number;
  themeId: number;
  onClose: () => void;
  onUpdate: () => void;
  formation: Domaine;
}

const EditTheme: React.FC<EditThemesProps> = ({
  domaineId,
  themeId,
  onClose,
  onUpdate,
  formation,
}) => {
  const [catalogueData, setCatalogueData] = useState<Domaine[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Session | null>(null);
  const [selectedFormateurs, setSelectedFormateurs] = useState<Formateur[]>([]);
  const [newFormateurId, setNewFormateurId] = useState<number | null>(null);
  const [newFormateurRank, setNewFormateurRank] = useState<number | null>(null);

  // Fetch catalogue data (domaines, themes, formateurs)
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`)
      .then((response) => {
        setCatalogueData(response.data);

        // Trouver le thème par défaut correspondant à themeId
        const selected = response.data
          .flatMap((domaine: Domaine) => domaine.sessions)
          .find((session: Session) => session.id_theme === themeId);

        if (selected) {
          setSelectedTheme(selected);
          setSelectedFormateurs(selected.formateurs || []);
        }
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération du catalogue:", error)
      );
  }, [themeId]);

  // Fetch all formateurs
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        setFormateurs(response.data);
      })
      .catch((error) =>
        console.error("Erreur lors de la récupération des formateurs:", error)
      );
  }, []);

  const handleAddFormateur = () => {
    if (newFormateurId && newFormateurRank) {
      const formateurToAdd = formateurs.find(
        (formateur) => formateur.id_formateur === newFormateurId
      );
      if (formateurToAdd) {
        setSelectedFormateurs([
          ...selectedFormateurs,
          { ...formateurToAdd, rang: newFormateurRank },
        ]);
        setNewFormateurId(null);
        setNewFormateurRank(null);
      }
    }
  };

  const handleRemoveFormateur = (idFormateur: number) => {
    setSelectedFormateurs(
      selectedFormateurs.filter((f) => f.id_formateur !== idFormateur)
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedTheme) return;

    try {
      // Identifiez les formateurs à ajouter, à modifier et à supprimer
      const formateursToAdd = selectedFormateurs.filter(
        (f) =>
          !selectedTheme.formateurs.some(
            (original) => original.id_formateur === f.id_formateur
          )
      );

      const formateursToUpdate = selectedFormateurs.filter((f) =>
        selectedTheme.formateurs.some(
          (original) =>
            original.id_formateur === f.id_formateur &&
            original.rang !== f.rang
        )
      );

      const formateursToRemove = selectedTheme.formateurs
        .filter(
          (original) =>
            !selectedFormateurs.some(
              (updated) => updated.id_formateur === original.id_formateur
            )
        )
        .map((f) => f.id_formateur);

      // Envoi des données
      const { data } = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue/themes/${selectedTheme.id_theme}/formateurs`,
        {
          formateursToAdd: formateursToAdd.map((f) => ({
            id_formateur: f.id_formateur,
            rang: f.rang || 1,
          })),
          formateursToUpdate: formateursToUpdate.map((f) => ({
            id_formateur: f.id_formateur,
            rang: f.rang || 1,
          })),
          formateursToRemove,
        },
        {
          timeout: 20000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      // Rafraîchissement et fermeture
      await onUpdate();
      alert("Les modifications ont été enregistrées avec succès");
      onClose();
    } catch (error) {
      let errorMessage = "Échec de l'enregistrement";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.message ||
          "Erreur de communication avec le serveur";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      console.error("Détails de l'erreur:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Éditer un Thème
      </h2>

      {/* Affichage du thème sélectionné par défaut */}
      {selectedTheme && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Thème</h3>
          <p className="text-gray-600">{selectedTheme.theme}</p>
        </div>
      )}

      {/* Liste des formateurs déjà attribués */}
      {selectedTheme && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Formateurs attribués
          </h3>
          {selectedFormateurs.length > 0 ? (
            selectedFormateurs.map((formateur) => (
              <div
                key={formateur.id_formateur}
                className="flex items-center p-2 mb-2 bg-gray-100 border rounded"
              >
                <span className="flex-1">{formateur.nom_complet}</span>
                <input
                  type="number"
                  min="1"
                  className="w-20 p-1 border rounded mr-2"
                  value={formateur.rang || ""}
                  onChange={(e) =>
                    setSelectedFormateurs(
                      selectedFormateurs.map((f) =>
                        f.id_formateur === formateur.id_formateur
                          ? { ...f, rang: parseInt(e.target.value, 10) }
                          : f
                      )
                    )
                  }
                />
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFormateur(formateur.id_formateur)}
                >
                  Supprimer
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Aucun formateur attribué</p>
          )}
        </div>
      )}

      {/* Ajouter un nouveau formateur */}
      {selectedTheme && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Ajouter un formateur
          </h3>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 p-2 border rounded"
              value={newFormateurId || ""}
              onChange={(e) =>
                setNewFormateurId(parseInt(e.target.value, 10) || null)
              }
            >
              <option value="">-- Sélectionnez un formateur --</option>
              {formateurs
                .filter(
                  (f) =>
                    !selectedFormateurs.some(
                      (sf) => sf.id_formateur === f.id_formateur
                    )
                )
                .map((formateur) => (
                  <option
                    key={formateur.id_formateur}
                    value={formateur.id_formateur}
                  >
                    {formateur.nom_complet}
                  </option>
                ))}
            </select>
            <input
              type="number"
              min="1"
              className="w-20 p-2 border rounded"
              placeholder="Rang"
              value={newFormateurRank || ""}
              onChange={(e) =>
                setNewFormateurRank(parseInt(e.target.value, 10) || null)
              }
            />
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
              onClick={handleAddFormateur}
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Bouton pour enregistrer les modifications */}
      {selectedTheme && (
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSaveChanges}
          >
            Enregistrer les modifications
          </button>
        </div>
      )}
    </div>
  );
};

export default EditTheme;






{/**********************BACK-END POUR MODIFIER RANG ET SUPPRIMER********************
  const UpdateTheme = async (req, res) => {
  const { id_theme } = req.params;
  const { formateursToAdd, formateursToRemove } = req.body;

  if (!Array.isArray(formateursToAdd) || !Array.isArray(formateursToRemove)) {
    return res.status(400).json({ error: "Les données doivent être des tableaux" });
  }

  try {
    // 1. Récupérer le nom du thème
    const themeQuery = 'SELECT theme FROM theme WHERE id_theme = ?';
    db.query(themeQuery, [id_theme], async (themeErr, themeResults) => {
      if (themeErr) {
        console.error("Erreur lors de la récupération du thème:", themeErr);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (!themeResults || themeResults.length === 0) {
        return res.status(404).json({ error: "Thème non trouvé" });
      }

      const themeName = themeResults[0].theme;

      // 2. Traitement des formateurs à supprimer
      for (const id_formateur of formateursToRemove) {
        await new Promise((resolve, reject) => {
          db.query(
            'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
            [id_formateur],
            async (formateurErr, formateurResults) => {
              if (formateurErr) {
                console.error("Erreur lors de la récupération du formateur:", formateurErr);
                return reject(formateurErr);
              }

              if (formateurResults && formateurResults.length > 0) {
                const formateur = formateurResults[0];
                let themes = {};
                
                try {
                  themes = formateur.themes_a_enseigner 
                    ? JSON.parse(formateur.themes_a_enseigner)
                    : {};
                } catch (e) {
                  console.error("Erreur de parsing JSON:", e);
                  return resolve();
                }

                if (themes[themeName]) {
                  delete themes[themeName];
                  
                  // Mise à jour des domaines de compétences
                  const domaines = Object.keys(themes);
                  
                  db.query(
                    'UPDATE formateur SET themes_a_enseigner = ?, domaine_de_competences = ? WHERE id_formateur = ?',
                    [JSON.stringify(themes), domaines.join(','), id_formateur],
                    (updateErr) => {
                      if (updateErr) {
                        console.error("Erreur lors de la mise à jour:", updateErr);
                        return reject(updateErr);
                      }
                      resolve();
                    }
                  );
                } else {
                  resolve();
                }
              } else {
                resolve();
              }
            }
          );
        });
      }

      // 3. Traitement des formateurs à ajouter/modifier
      for (const { id_formateur, rang } of formateursToAdd) {
        await new Promise((resolve, reject) => {
          db.query(
            'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
            [id_formateur],
            async (formateurErr, formateurResults) => {
              if (formateurErr) {
                console.error("Erreur lors de la récupération du formateur:", formateurErr);
                return reject(formateurErr);
              }

              if (formateurResults && formateurResults.length > 0) {
                const formateur = formateurResults[0];
                let themes = {};
                
                try {
                  themes = formateur.themes_a_enseigner 
                    ? JSON.parse(formateur.themes_a_enseigner)
                    : {};
                } catch (e) {
                  console.error("Erreur de parsing JSON:", e);
                  return resolve();
                }

                themes[themeName] = rang;
                const domaines = Object.keys(themes);
                
                db.query(
                  'UPDATE formateur SET themes_a_enseigner = ?, domaine_de_competences = ? WHERE id_formateur = ?',
                  [JSON.stringify(themes), domaines.join(','), id_formateur],
                  (updateErr) => {
                    if (updateErr) {
                      console.error("Erreur lors de la mise à jour:", updateErr);
                      return reject(updateErr);
                    }
                    resolve();
                  }
                );
              } else {
                resolve();
              }
            }
          );
        });
      }

      res.json({ 
        success: true, 
        message: "Mise à jour des formateurs réussie" 
      });
    });

  } catch (error) {
    console.error("Erreur backend complète:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Erreur serveur lors de la mise à jour" 
    });
  }
}; */}
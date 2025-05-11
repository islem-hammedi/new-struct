import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

interface FormateurWithRank {
  id_formateur: number;
  nom_complet: string;
  rang: number;
}

interface Session {
  id_theme: number;
  theme: string;
  formateur: FormateurWithRank[];
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

interface Formation {
  id_domaine: number;
  domaine: string;
  themes: Session[];
}

interface UpdateFormationProps {
  formation: Formation;
  domaineId: number;
  onUpdate: () => void;
  onClose: () => void;
}

const EditDomaine: React.FC<UpdateFormationProps> = ({
  onClose,
  onUpdate,
  formation,
  domaineId,
}) => {
  const formationString = JSON.stringify(formation);

  const defaultValues = React.useMemo(() => {
    const currentFormation = JSON.parse(formationString);
    return {
      id_domaine: currentFormation?.id_domaine || 0,
      domaine: currentFormation?.domaine || "",
      themes:
        currentFormation?.themes?.map((theme: Session) => ({
          id_theme: theme.id_theme || 0,
          theme: theme.theme || "",
          formateur: theme.formateur || [],
        })) || [],
    };
  }, [formationString]);

  const { register, handleSubmit, control } = useForm<Formation>({
    defaultValues,
  });

  const { fields: themeFields } = useFieldArray({
    control,
    name: "themes",
  });

  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [selectedFormateurs, setSelectedFormateurs] = useState<
    Record<string, FormateurWithRank[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormateurs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`
        );
        setFormateurs(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des formateurs :", error);
      }
    };

    fetchFormateurs();
  }, []);

  
  const fetchFormateurs = async (id_theme: number) => {
    try {
      const response = await axios.get(`/apiAdmin/catalogue/${id_theme}`);
      if (response.data.success) {
        setFormateurs(response.data.formateurs);
      } else {
        console.error('Erreur serveur:', response.data.error);
        // Afficher un message à l'utilisateur
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.error('theme non trouvée:', id_theme);
          // Afficher un message "Session non trouvée"
        } else {
          console.error('Erreur serveur:', error.response?.data?.error || error.message);
          // Afficher un message d'erreur générique
        }
      } else {
        console.error('Erreur inattendue:', error);
      }
    }
  };
  useEffect(() => {
    const fetchExistingFormateursForSessions = async () => {
      if (!formation?.themes) return;
  
      setIsLoading(true);
      try {
        const initialSelectedFormateurs: Record<string, FormateurWithRank[]> = {};
  
        await Promise.all(
          formation.themes.map(async (theme, index) => {
            try {
              const response = await axios.get(
                `${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue/${theme.id_theme}`
              );
              
              // Adapté à la structure de réponse { id_session, theme, formateurs }
              initialSelectedFormateurs[`theme_${index}`] = 
                response.data.formateurs?.map((f: any) => ({
                  id_formateur: f.id_formateur,
                  nom_complet: f.nom_complet,
                  rang: f.rang || 1
                })) || [];
            } catch (error) {
              console.error(`Erreur theme ${theme.id_theme}:`, error);
              initialSelectedFormateurs[`theme_${index}`] = [];
            }
          })
        );
  
        setSelectedFormateurs(initialSelectedFormateurs);
      } catch (error) {
        console.error("Erreur globale:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchExistingFormateursForSessions();
  }, [formation]);

  const handleAddFormateur = (themeIndex: number, formateurId: number) => {
    const themeKey = `theme_${themeIndex}`;
    setSelectedFormateurs((prev) => {
      const currentFormateurs = prev[themeKey] || [];

      if (!currentFormateurs.some((f) => f.id_formateur === formateurId)) {
        const formateurToAdd = formateurs.find(
          (f) => f.id_formateur === formateurId
        );
        if (formateurToAdd) {
          return {
            ...prev,
            [themeKey]: [
              ...currentFormateurs,
              {
                id_formateur: formateurToAdd.id_formateur,
                nom_complet: formateurToAdd.nom_complet,
                rang:
                  currentFormateurs.length > 0
                    ? Math.max(...currentFormateurs.map((f) => f.rang)) + 1
                    : 1,
              },
            ],
          };
        }
      }
      return prev;
    });
  };

  const handleRemoveFormateur = (themeIndex: number, formateurId: number) => {
    setSelectedFormateurs((prev) => {
      const themeKey = `theme_${themeIndex}`;
      if (!prev[themeKey]) return prev;

      return {
        ...prev,
        [themeKey]: prev[themeKey].filter(
          (f) => f.id_formateur !== formateurId
        ),
      };
    });
  };

  const handleRankChange = (
    themeIndex: number,
    formateurId: number,
    value: string
  ) => {
    const rang = parseInt(value) || 1;

    setSelectedFormateurs((prev) => {
      const themeKey = `theme_${themeIndex}`;
      if (!prev[themeKey]) return prev;

      return {
        ...prev,
        [themeKey]: prev[themeKey]
          .map((f) =>
            f.id_formateur === formateurId ? { ...f, rang } : f
          )
          .sort((a, b) => a.rang - b.rang),
      };
    });
  };

  const onSubmit = async (data: Session) => {
    if (!domaineId || isNaN(domaineId)) {
      console.error("ID de domaine invalide:", domaineId);
      alert("Erreur: ID de domaine manquant ou invalide");
      return;
    }
     if (!domaineId || isNaN(domaineId)) {
      console.error("ID de domaine invalide:", domaineId);
      alert("Erreur: ID de domaine manquant ou invalide");
      return;
    }
    try {
      const finalData = {
        ...data,
        themes: data.themes.map((theme, index) => ({
          ...theme,
          formateurs: selectedFormateurs[`theme_${index}`] || [],
        })),
      };

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue/updateDomain/${domaineId}`,
        finalData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      onUpdate();
      alert("Domaine et thèmes mis à jour avec succès !");
    } catch (error) {
      let errorMessage = "Une erreur est survenue lors de la mise à jour";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Erreur lors de la communication avec le serveur";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Erreur complète:", error);
      alert(`Erreur: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Chargement en cours...</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Modifier le Thème</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Nom du Domaine :</label>
            <input
              className="w-full p-2 border rounded"
              {...register("domaine", { required: true })}
            />
          </div>

          <h3 className="text-xl font-semibold mb-2">Thèmes :</h3>

          {themeFields.map((theme, themeIndex) => (
            <div key={theme.id} className="border p-4 rounded-lg bg-gray-50">
              <div className="mb-4">
                <label>Nom du Thème :</label>
                <input
                  className="w-full p-2 border rounded"
                  {...register(`themes.${themeIndex}.theme`, {
                    required: true,
                  })}
                />
              </div>

              <div className="mb-4">
                <label>Ajouter un formateur :</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border rounded"
                    onChange={(e) => {
                      const formateurId = parseInt(e.target.value);
                      if (formateurId) {
                        handleAddFormateur(themeIndex, formateurId);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Sélectionnez un formateur</option>
                    {formateurs
                      .filter(
                        (f) =>
                          !selectedFormateurs[`theme_${themeIndex}`]?.some(
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
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Formateurs affectés :</h4>
                {selectedFormateurs[`theme_${themeIndex}`]?.length > 0 ? (
                  selectedFormateurs[`theme_${themeIndex}`].map((formateur) => (
                    <div
                      key={formateur.id_formateur}
                      className="flex items-center gap-3 p-2 bg-white border rounded"
                    >
                      <span className="flex-1">{formateur.nom_complet}</span>
                      <input
                        type="number"
                        min="1"
                        className="w-20 p-1 border rounded"
                        value={formateur.rang}
                        onChange={(e) =>
                          handleRankChange(
                            themeIndex,
                            formateur.id_formateur,
                            e.target.value
                          )
                        }
                      />
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          handleRemoveFormateur(themeIndex, formateur.id_formateur)
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 p-2">
                    Aucun formateur affecté
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDomaine;




{/*}
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

interface Formateur {
  id_formateur: number;
  nom_complet: string;
  themes_a_enseigner?: string;
  rang?: number;
}

interface ThemeData {
  id_theme?: number;
  theme?: string;
  formateurs?: Formateur[];
}

interface EditThemeProps {
  themeData?: ThemeData; // Les données du thème à modifier
  onClose: () => void; // Fonction pour fermer le modal
  onUpdate: () => void; // Callback après mise à jour réussie
}

const EditTheme: React.FC<EditThemeProps> = ({ themeData, onClose, onUpdate }) => {
  const { register, handleSubmit, setValue } = useForm<{ theme: string }>();
  const [selectedFormateurs, setSelectedFormateurs] = useState<Formateur[]>([]);
  const [allFormateurs, setAllFormateurs] = useState<Formateur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les formateurs déjà affectés au thème
  useEffect(() => {
    if (!themeData?.id_theme) {
      setError("Aucun thème sélectionné");
      setIsLoading(false);
      return;
    }

    const fetchThemeFormateurs = async () => {
      try {
        const response = await axios.get(`/apiAdmin/catalogue/${themeData.id_theme}`);
        if (response.data.success) {
          setSelectedFormateurs(response.data.formateurs || []);
          setValue('theme', themeData.theme || '');
        } else {
          setError(response.data.error || 'Erreur lors de la récupération des formateurs');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la récupération des formateurs du thème');
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemeFormateurs();
  }, [themeData?.id_theme, themeData?.theme, setValue]);

  // Récupérer tous les formateurs disponibles
  useEffect(() => {
    const fetchAllFormateurs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`);
        setAllFormateurs(response.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des formateurs :", error);
        setError("Erreur lors de la récupération de la liste des formateurs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFormateurs();
  }, []);

  const handleAddFormateur = async (formateurId: number) => {
    const formateurToAdd = allFormateurs.find(f => f.id_formateur === formateurId);
    if (!formateurToAdd) return;

    try {
      const response = await axios.post(`/apiAdmin/catalogue/${themeData?.id_theme}/formateurs`, {
        id_formateur: formateurId,
        rang: 1 // Rang par défaut
      });

      if (response.data.success) {
        setSelectedFormateurs(prev => [...prev, { ...formateurToAdd, rang: 1 }]);
      } else {
        setError(response.data.error || "Erreur lors de l'ajout du formateur");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du formateur:", error);
      setError("Erreur lors de l'ajout du formateur");
    }
  };

  const handleRemoveFormateur = async (formateurId: number) => {
    try {
      const response = await axios.delete(`/apiAdmin/catalogue/${themeData?.id_theme}/formateurs/${formateurId}`);
      if (response.data.success) {
        setSelectedFormateurs(prev =>
          prev.filter(f => f.id_formateur !== formateurId)
        );
      } else {
        setError(response.data.error || "Erreur lors de la suppression du formateur");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du formateur:", error);
      setError("Erreur lors de la suppression du formateur");
    }
  };

  const handleRankChange = async (formateurId: number, newRank: number) => {
    try {
      const response = await axios.put(
        `/apiAdmin/catalogue/${themeData?.id_theme}/formateurs/${formateurId}`,
        { rang: newRank }
      );

      if (response.data.success) {
        setSelectedFormateurs(prev =>
          prev.map(f => f.id_formateur === formateurId ? { ...f, rang: newRank } : f)
        );
      } else {
        setError(response.data.error || "Erreur lors de la mise à jour du rang");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rang:", error);
      setError("Erreur lors de la mise à jour du rang");
    }
  };

  const onSubmit = async (data: { theme: string }) => {
    try {
      const response = await axios.put(`/apiAdmin/catalogue/${themeData?.id_theme}`, {
        theme: data.theme
      });

      if (response.data.success) {
        onUpdate(); // Notifier le parent que la mise à jour est réussie
        onClose(); // Fermer le modal
      } else {
        setError(response.data.error || "Erreur lors de la mise à jour du thème");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du thème:", error);
      setError("Erreur lors de la mise à jour du thème");
    }
  };

  const availableFormateurs = allFormateurs.filter(
    f => !selectedFormateurs.some(sf => sf.id_formateur === f.id_formateur)
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Modifier le Thème</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-2">Nom du Thème :</label>
            <input
              className="w-full p-2 border rounded"
              {...register("theme", { required: true })}
            />
          </div>

          <div>
            <label>Ajouter un formateur :</label>
            <div className="flex gap-2 mt-2">
              <select
                className="flex-1 p-2 border rounded"
                onChange={(e) => {
                  const formateurId = parseInt(e.target.value);
                  if (formateurId) {
                    handleAddFormateur(formateurId);
                    e.target.value = "";
                  }
                }}
                disabled={availableFormateurs.length === 0}
              >
                <option value="">Sélectionnez un formateur</option>
                {availableFormateurs.map((formateur) => (
                  <option
                    key={formateur.id_formateur}
                    value={formateur.id_formateur}
                  >
                    {formateur.nom_complet}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Formateurs affectés :</h3>
            {selectedFormateurs.length > 0 ? (
              selectedFormateurs.map((formateur) => (
                <div
                  key={formateur.id_formateur}
                  className="flex items-center gap-3 p-2 bg-gray-50 border rounded"
                >
                  <span className="flex-1">{formateur.nom_complet}</span>
                  <input
                    type="number"
                    min="1"
                    className="w-20 p-1 border rounded"
                    value={formateur.rang || 1}
                    onChange={(e) =>
                      handleRankChange(formateur.id_formateur, parseInt(e.target.value))
                    }
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFormateur(formateur.id_formateur)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 p-2">Aucun formateur affecté</div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTheme;*/}
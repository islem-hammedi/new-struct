

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

// Définition des types
interface FormateurWithRank {
  id_formateur: number;
  nom_complet: string;
  rang: number;
}

interface ThemeData {
  name: string;
  code: string;
  formateurs: FormateurWithRank[];
}

interface AddFormationProps {
  onFormationAdded: () => void;
  onClose: () => void;
}

interface DomaineData {
  domaineName: string;
  abbreviation: string;
  themes: ThemeData[];
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

const AddDomaine: React.FC<AddFormationProps> = ({ onClose, onFormationAdded }) => {
  const { register, handleSubmit, reset, control, setValue, watch } = useForm<DomaineData>({
    defaultValues: {
      domaineName: "",
      abbreviation: "",
      themes: [{ name: "", code: "", formateurs: [] }],
    },
  });

  const { fields: themeFields, append: appendTheme, remove: removeTheme } = useFieldArray({
    control,
    name: "themes",
  });

  const abbreviation = watch("abbreviation");
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [selectedFormateurs, setSelectedFormateurs] = useState<Record<string, FormateurWithRank[]>>({});

  {/*const generateThemeCode = (index: number) => {
    const themeCode = `${abbreviation}${index + 1}`;
    setValue(`themes.${index}.code`, themeCode);
  };*/}

  const generateThemeCode = (index: number) => {
    const paddedIndex = (index + 1).toString().padStart(3, '0');
    const themeCode = `${abbreviation}${paddedIndex}`;
    setValue(`themes.${index}.code`, themeCode);
};

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => {
        setFormateurs(response.data);
      })
      .catch(error => console.error("Erreur lors de la récupération des formateurs :", error));
  }, []);

  const handleAddFormateur = (themeIndex: number, formateurId: number) => {
    const formateur = formateurs.find(f => f.id_formateur === formateurId);
    if (!formateur) return;

    setSelectedFormateurs(prev => {
      const themeKey = `theme_${themeIndex}`;
      const currentFormateurs = prev[themeKey] || [];
      
      // Vérifier si le formateur est déjà sélectionné
      if (currentFormateurs.some(f => f.id_formateur === formateurId)) {
        return prev;
      }

      return {
        ...prev,
        [themeKey]: [...currentFormateurs, { ...formateur, rang: 0 }]
      };
    });
  };

  const handleRemoveFormateur = (themeIndex: number, formateurId: number) => {
    setSelectedFormateurs(prev => {
      const themeKey = `theme_${themeIndex}`;
      if (!prev[themeKey]) return prev;

      return {
        ...prev,
        [themeKey]: prev[themeKey].filter(f => f.id_formateur !== formateurId)
      };
    });
  };

  const handleRankChange = (themeIndex: number, formateurId: number, value: string) => {
    const rang = parseInt(value) || 0;
    
    setSelectedFormateurs(prev => {
      const themeKey = `theme_${themeIndex}`;
      if (!prev[themeKey]) return prev;

      return {
        ...prev,
        [themeKey]: prev[themeKey].map(f => 
          f.id_formateur === formateurId ? { ...f, rang } : f
        )
      };
    });
  };

  const onSubmit = async (data: DomaineData) => {
    try {
      const finalData = {
        ...data,
        themes: data.themes.map((theme, index) => ({
          ...theme,
          formateurs: selectedFormateurs[`theme_${index}`] || []
        }))
      };

      console.log("Données envoyées:", finalData);

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue/addDomain`,
        finalData
      );

      if (response.status !== 201 && response.status !== 200) {
        throw new Error("Erreur lors de la création du domaine");
      }

     
      onFormationAdded();
      reset();
      setSelectedFormateurs({});
      alert("Domaine et thèmes créés avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Une erreur est survenue lors de la création");
    }
  };

  return (
    
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
      <br/><br/><br/>

        <h2 className="text-2xl font-bold mb-4">Ajouter un Domaine</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Nom du Domaine :</label>
              <input 
                className="w-full p-2 border rounded" 
                {...register("domaineName", { required: true })} 
              />
            </div>
            <div>
              <label className="block mb-2">Code commence par :</label>
              <input 
                className="w-full p-2 border rounded" 
                {...register("abbreviation", { required: true })} 
              />
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">Thèmes :</h3>
          
          {themeFields.map((theme, themeIndex) => (
            <div key={theme.id} className="border p-4 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label>Nom du Thème :</label>
                  <input
                    className="w-full p-2 border rounded"
                    {...register(`themes.${themeIndex}.name`, { required: true })}
                    onBlur={() => generateThemeCode(themeIndex)}
                  />
                </div>
                <div>
                  <label>Code du Thème :</label>
                  <input
                    className="w-full p-2 border rounded bg-gray-100"
                    {...register(`themes.${themeIndex}.code`)}
                    readOnly
                  />
                </div>
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
                      .filter(f => !selectedFormateurs[`theme_${themeIndex}`]?.some(sf => sf.id_formateur === f.id_formateur))
                      .map(formateur => (
                        <option key={formateur.id_formateur} value={formateur.id_formateur}>
                          {formateur.nom_complet}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Formateurs sélectionnés :</h4>
                {selectedFormateurs[`theme_${themeIndex}`]?.map(formateur => (
                  <div key={formateur.id_formateur} className="flex items-center gap-3 p-2 bg-white border rounded">
                    <span className="flex-1">{formateur.nom_complet}</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Rang"
                      className="w-20 p-1 border rounded"
                      value={formateur.rang || ""}
                      onChange={(e) => handleRankChange(themeIndex, formateur.id_formateur, e.target.value)}
                    />
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFormateur(themeIndex, formateur.id_formateur)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

         <div className="flex justify-between">
            <button
              type="button"
              className="bg-teal-500 text-white px-4 py-2 rounded"
              onClick={() => appendTheme({ name: "", code: "", formateurs: [] })}
            >
              Ajouter un thème
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              className="bg-gray-400 text-white px-4 py-2 rounded" 
              onClick={onClose}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
            >
              Enregistrer le domaine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDomaine;

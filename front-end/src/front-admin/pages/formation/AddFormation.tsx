import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

// Définition des types
interface SessionData {
  theme: string;
    type_session: string;
    lieu?: string;
    id_formateur: number;
    fiche_programme?: File;
    mode?: string;
    duree?: string;
    nb_participants?: number;
    genre?: string;
}

interface FormationData {
  id_formation: number;
  id_domaine: number;
  domaine: string;
  sessions: SessionData[];
}

interface AddFormationProps {
  onFormationAdded: () => void;
  onClose: () => void;
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}

const AddFormation: React.FC<AddFormationProps> = ({ onClose, onFormationAdded }) => {
  const { register, handleSubmit, control, reset, setValue, watch  } = useForm<FormationData>({
    defaultValues: {
      id_domaine: null,
      domaine: "",
      sessions: [{ theme: "", nb_participants: 0, type_session: "", lieu: '', id_formateur: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sessions",
  });

  const [selectedType, setSelectedType] = useState('');
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [formations, setFormations] = useState<FormationData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomaineId, setSelectedDomaineId] = useState<number | null>(null);
  const [themes, setThemes] = useState<string[]>([]);

  const selectedDomaineValue = watch("domaine");
  
  useEffect(() => {
    // Charger les formateurs
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => setFormateurs(response.data))
      .catch(error => console.error("Erreur formateurs:", error));

    // Charger les domaines avec leurs IDs
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaine-themes`)
      .then(response => {
        let domainesData = [];
        
        if (typeof response.data === 'string') {
          domainesData = response.data.split('\n')
            .filter(Boolean)
            .map((domaine, index) => ({ 
              id_domaine: index + 1, 
              domaine 
            }));
        } else if (Array.isArray(response.data)) {
          domainesData = response.data;
        }
        
        setFormations(domainesData);
      })
      .catch(error => {
        console.error("Erreur domaines:", error);
        setFormations([]);
      });
  }, []);

  useEffect(() => {
    if (selectedDomaineId) {
      axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/themes`, {
        params: { id_domaine: selectedDomaineId }
      })
      .then(response => {
        // Gestion robuste des différents formats de réponse
        const themesData = response.data?.themes || 
                         (Array.isArray(response.data) ? response.data : []);
        setThemes(themesData);
      })
      .catch(error => {
        console.error("Erreur thèmes:", error);
        setThemes([]);
      });
    } else {
      setThemes([]);
    }
  }, [selectedDomaineId]);



  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  const onSubmit = async (data: FormationData) => {
    try {
      const formData = new FormData();
      const date = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

      // Ajouter les données de base
      formData.append("domaine", data.domaine);

      // Préparer les sessions pour l'envoi
      const sessionsToSend = data.sessions.map((session, index) => {
        return {
          theme: session.theme,
          type_session: session.type_session,
          lieu: session.lieu ||null,
          id_formateur: session.id_formateur,
          mode: session.mode || 'inter-entreprise',
          duree: session.duree ,
          nb_participants: session.nb_participants || 0,
          genre: session.genre || 'normal',
          requireFile: !!session.fiche_programme,
          CreatedAt: date
        }
      });
      
      // Ajouter les sessions au FormData
      formData.append("sessions", JSON.stringify(sessionsToSend));
      
      // Ajouter les fichiers séparément
      data.sessions.forEach((session, index) => {
        if (session.fiche_programme instanceof File) {
          // Utiliser le même nom de champ que dans multer
          formData.append("fiche_programme", session.fiche_programme);
        }
      });

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
          } 
        }
      );

      if (response.data.success) {
        onFormationAdded();
        onClose();
        // Optionnel: Afficher un message de succès
        alert('Formation créée avec succès!');
      } else {
        throw new Error(response.data.message || "Erreur lors de la création de la formation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Afficher un message d'erreur plus clair
      alert(error.response?.data?.message || 
           error.message || 
           "Une erreur est survenue lors de la création de la formation");
    }
};
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 sm:max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Planifier une Formation</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="block mb-2">Domaine :</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-2"
            placeholder="Rechercher un domaine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
         <select
          className="w-full p-2 border rounded mb-2"
          {...register("id_domaine", { required: true })}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedDomaineId(isNaN(id) ? null : id);
            setValue("domaine", 
              formations.find(d => d.id_domaine === id)?.domaine || "");
          }}
        >
          <option value="">Sélectionnez un domaine</option>
          {formations.map((domaine) => (
            <option key={domaine.id_domaine} value={domaine.id_domaine}>
              {domaine.domaine}
            </option>
          ))}
        </select>
          <h3 className="text-xl font-semibold mb-2">Sessions :</h3>
          {fields.map((item, index) => (
            <div key={item.id} className="border p-3 mb-3 rounded bg-gray-100">
              <label>Thème :</label>
              <select 
    className="w-full p-2 border rounded mb-2" 
    {...register(`sessions.${index}.theme`, { required: true })}
>
    <option value="">Sélectionnez un thème</option>
    {themes.map((theme, i) => (
        <option key={i} value={theme}>
            {theme}
        </option>
    ))}
</select>
              
              <label className="block text-gray-700">Nombre de participants :</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded mb-2" 
                {...register(`sessions.${index}.nb_participants`, { required: true })} 
              />
              
              <label>Type de Session :</label>
              <select 
                className="w-full p-2 border rounded mb-2" 
                {...register(`sessions.${index}.type_session`, { required: true })} 
                onChange={handleTypeChange}
              >
                <option value="">Sélectionnez un type</option>
                <option value="Présentiel">Présentiel</option>
                <option value="En ligne">En ligne</option>
              </select>
              
              {selectedType === 'Présentiel' && (
                <div>
                  <label>Lieu :</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded mb-2" 
                    {...register(`sessions.${index}.lieu`)} 
                  />
                </div>
              )}
             
              <label>Formateur :</label>
              <select 
                className="w-full p-2 border rounded mb-2" 
                {...register(`sessions.${index}.id_formateur`, { required: true })}
              >
                <option value="">Sélectionnez un formateur</option>
                {formateurs.map((formateur) => (
                  <option key={formateur.id_formateur} value={formateur.id_formateur}>
                    {formateur.nom_complet}
                  </option>
                ))}
              </select>
              
              <label>Fiche Programme (PDF) :</label>
              <input 
                type="file" 
                accept="application/pdf" 
                className="w-full p-2 border rounded mb-2" 
                onChange={(e) => setValue(`sessions.${index}.fiche_programme`, e.target.files?.[0])} 
              />
            </div>
          ))}

          <div className="flex justify-end">
            <button type="button" className="bg-gray-500 text-white p-2 rounded mr-2" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="bg-teal-600 text-white p-2 rounded">
              Ajouter Formation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFormation;
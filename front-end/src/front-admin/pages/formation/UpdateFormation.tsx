import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuthAdmin";
import { useForm, useFieldArray } from "react-hook-form";

// ... (vos interfaces restent les mêmes)

interface Session {
  id_session: number;
  theme: string;
  code: string;
  nb_participants: number;
  etat: string;
  type_session: string;
  lieu: string;
  formateur: string;
  fiche_prg: string | null;
  cours_session: string | null;
  id_formateur: number;
  date_debut: string;
  date_fin: string;
  genre: string;
  mode: string;
  duree: number;
  createdAt: string;
}

interface Formation {
  id_formation: number;
  domaine: string;
  sessions: Session[];
}

interface Formateur {
  id_formateur: number;
  nom_complet: string;
}
const UpdateFormation: React.FC<UpdateFormationProps> = ({ formation, onUpdate, onCancel }) => {
  const { user } = useAuth();
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [fichePrgFile, setFichePrgFile] = useState<File | null>(null);
  const [coursSessionFile, setCoursSessionFile] = useState<File | null>(null);

  const { 
    register, 
    handleSubmit, 
    control, 
    setValue,
    watch,
    formState: { errors } 
  } = useForm<Formation>({
    defaultValues: {
      ...formation,
      sessions: formation.sessions || []
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "sessions"
  });

  useEffect(() => {
    // Charger les formateurs
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => setFormateurs(response.data))
      .catch(error => console.error("Erreur formateurs:", error));

    // Initialiser les valeurs des sessions
    if (formation.sessions && formation.sessions.length > 0) {
      formation.sessions.forEach((session, index) => {
        setValue(`sessions.${index}.theme`, session.theme);
        setValue(`sessions.${index}.etat`, session.etat);
        setValue(`sessions.${index}.type_session`, session.type_session);
        setValue(`sessions.${index}.id_formateur`, session.id_formateur);
        setValue(`sessions.${index}.mode`, session.mode);
        setValue(`sessions.${index}.genre`, session.genre);
        setValue(`sessions.${index}.nb_participant`, session.nb_participant);
        setValue(`sessions.${index}.lieu`, session.lieu);
      });
    }
  }, [formation, setValue]);

  const handleFichePrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFichePrgFile(e.target.files[0]);
    }
  };

  const handleCoursSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoursSessionFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: Formation) => {
    try {
      const formData = new FormData();
      const session = data.sessions[0];

      // Ajouter tous les champs nécessaires
      Object.entries(session).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (fichePrgFile) formData.append('fiche_programme', fichePrgFile);
      if (coursSessionFile) formData.append('cours_session', coursSessionFile);

      const response = await axios.put(`
        ${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form/${formation.id_formation}/sessions/${session.id_session}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onUpdate();
      } else {
        throw new Error(response.data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert('error.message');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-teal-800 mb-6">Modifier la Formation</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Domaine</label>
          <input 
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
            value={formation.domaine}
            readOnly
          />
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Sessions</h3>
          
          {fields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Thème (non modifiable) */}
                <div>
                  <label className="block text-gray-700 mb-1">Thème</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                    value={field.theme}
                    readOnly
                  />
                </div>

                {/* Formateur */}
                <div>
                  <label className="block text-gray-700 mb-1">Formateur</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.id_formateur`, { required: true })}
                  >
                    <option value="">Sélectionnez un formateur</option>
                    {formateurs.map((formateur) => (
                      <option key={formateur.id_formateur} value={formateur.id_formateur}>
                        {formateur.nom_complet}
                      </option>
                    ))}
                  </select>
                </div>

                {/* État */}
                <div>
                  <label className="block text-gray-700 mb-1">État</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.etat`, { required: true })}
                  >
                    <option value="A Réalisé">A Réalisé</option>
                    <option value="Déja Réalisé">Déja Réalisé</option>
                  </select>
                </div>

                {/* Type de Session */}
                <div>
                  <label className="block text-gray-700 mb-1">Type de Session</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.type_session`, { required: true })}
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="Présentiel">Présentiel</option>
                    <option value="En ligne">En ligne</option>
                  </select>
                </div>

                {/* Lieu (conditionnel) */}
                {watch(`sessions.${index}.type_session`) === 'Présentiel' && (
                  <div>
                    <label className="block text-gray-700 mb-1">Lieu</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded" 
                      {...register(`sessions.${index}.lieu`)} 
                    />
                  </div>
                )}

                {/* Mode */}
                <div>
                  <label className="block text-gray-700 mb-1">Mode</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.mode`, { required: true })}
                  >
                    <option value="">Sélectionnez un mode</option>
                    <option value="Inter">Inter-entreprise</option>
                    <option value="Intra">Intra-entreprise</option>
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-gray-700 mb-1">Genre</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.genre`, { required: true })}
                  >
                    <option value="">Sélectionnez un genre</option>
                    <option value="normal">normal</option>
                    <option value="profetionnel">profetionnel</option>
                  </select>
                </div>

                {/* Nombre de participants */}
                <div>
                  <label className="block text-gray-700 mb-1">Nombre de participants</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded" 
                    {...register(`sessions.${index}.nb_participant`, { min: 0 })} 
                  />
                </div>

                {/* Fiche programme */}
                <div>
                  <label className="block text-gray-700 mb-1">Fiche programme</label>
                  <input 
                    type="file" 
                    className="w-full p-2 border border-gray-300 rounded" 
                    onChange={handleFichePrgChange}
                    accept=".pdf,.doc,.docx"
                  />
                </div>

                {/* Cours de session */}
                <div>
                  <label className="block text-gray-700 mb-1">Cours de session</label>
                  <input 
                    type="file" 
                    className="w-full p-2 border border-gray-300 rounded" 
                    onChange={handleCoursSessionChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Mettre à jour
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateFormation;
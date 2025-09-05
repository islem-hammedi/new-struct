import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

// Définition des types
interface SessionData {
  id_session: number;
  theme: string;
  code: string;
  nb_participants: number;
  etat: string;
  type_session: string;
  lieu: string;
  formateur: string;
  fiche_programme: string | File | null| undefined;
  cours_session: string | File | null| undefined;
  id_formateur: number;
  genre: string;
  mode: string;
  createdAt: string;}

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
  const { register, handleSubmit, control, reset, setValue, watch } = useForm<FormationData>({
    defaultValues: {
      id_domaine: undefined,
      domaine: "",
      sessions: [{ theme: "", nb_participants: 0, type_session: "", lieu: '', id_formateur: 0 , mode:"", genre:""}],
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
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then(response => setFormateurs(response.data))
      .catch(error => console.error("Erreur formateurs:", error));
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaine/Domains`)
    .then(response => {
      if (Array.isArray(response.data)) {
        setFormations(response.data); 
        console.log("Domaines récupérés :", response.data);
      } else {
        console.error("Format inattendu pour les domaines :", response.data);
        setFormations([]);
      }
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des domaines :", error);
      setFormations([]);
    });
}, []);

  useEffect(() => {
    if (selectedDomaineId) {
      axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/themes`, {
        params: { id_domaine: selectedDomaineId }
      })
      .then(response => {
        const themesData = response.data?.themes || 
                         (Array.isArray(response.data) ? response.data : []);
        setThemes(themesData);
        console.log('theme de domaine:',themesData);

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
        
        formData.append("domaine", data.domaine);
        
        const sessionsToSend = data.sessions.map((session, index) => ({
            theme: session.theme,
            type_session: session.type_session,
            lieu: session.lieu || null,
            id_formateur: session.id_formateur,
            mode: session.mode ,
            nb_participants: session.nb_participants || 0,
            genre: session.genre ,
           

             }));
        
        formData.append("sessions", JSON.stringify(sessionsToSend));

        data.sessions.forEach((session, index) => {
          if (session.fiche_programme && session.fiche_programme instanceof File) {
              formData.append("fiche_programme" , session.fiche_programme); 
          }
          if (session.cours_session && session.cours_session instanceof File) {
              formData.append("cours_session", session.cours_session); 
          }
      });


        const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`,
            formData,
            { 
                headers: { 
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.data.success) {
            throw new Error(response.data.message || "Erreur serveur");
        }

        alert('Formation créée avec succès!');
        onFormationAdded();
        onClose();
    } catch (error) {
        console.error("Erreur détaillée:", error);
        let errorMessage = "Une erreur est survenue";
        
        if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        alert(`Échec de la création : ${errorMessage}`);
    }
};
return (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 z-50 overflow-y-auto">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
       <br/><br/><br/><br/><br/>
        <h2 className="text-xl text-teal-500 font-bold">Planifier une Formation</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
          &times;
        </button>
      </div>

      <div className="overflow-y-auto p-4 flex-1">
        <form id="hook-form" onSubmit={handleSubmit(onSubmit)}  className="space-y-4">
        
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Informations sur le domaine</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm">Rechercher un domaine :</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Tapez pour filtrer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
              <div>
                <label className="block mb-1 text-sm">Domaine :</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  {...register("id_domaine", { required: true })}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setSelectedDomaineId(id);
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
              </div>
            </div>
          </div>

          {/* Liste des sessions avec accordéons */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Sessions de formation</h3>
              <button
                type="button"
                onClick={() => append({
                  id_session:0,
                  code:"",
                  createdAt:"",
                  etat:"",
                  formateur:"",
                  theme: "",
                  type_session: "",
                  lieu: "",
                  id_formateur: 0,
                  mode: "presentiel",
                  nb_participants: 0,
                  genre: "intra-entreprise",
                  fiche_programme: "",
                  cours_session:"",
                })}
                className="text-sm bg-teal-600 text-white px-3 py-1 rounded hover:bg-teal-700"
              >
                + Ajouter session
              </button>
            </div>

            {fields.map((item, index) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <input 
                  type="checkbox" 
                  id={`session-${index}`} 
                  className="peer hidden"
                  defaultChecked={index === 0}
                />
                <label 
                  htmlFor={`session-${index}`} 
                  className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
                >
                  <span className="font-medium">
                    Session {index + 1} {`watch(sessions.${index}.theme) && : ${`watch(sessions.${index}.theme)`}`}
                  </span>
                  <svg className="w-4 h-4 transition-transform peer-checked:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </label>
                
                <div className="p-4 hidden peer-checked:block space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                    <div>
                      <label className="block mb-1 text-sm">Thème :</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
                        {...register(`sessions.${index}.theme`, { required: true })}
                      >
                        <option value="">Sélectionnez un thème</option>
                        {themes.map((theme, i) => (
                          <option key={i} value={theme}>
                            {theme}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Formateur :</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Mode :</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
                        {...register(`sessions.${index}.mode`, { required: true })} 
                        onChange={(e) => {
                          handleTypeChange(e);
                          setValue(`sessions.${index}.mode`, e.target.value);
                        }}
                      >
                        <option value="">Sélectionnez</option>
                        <option value="prssentiel">Présentiel</option>
                        <option value="en ligne">En ligne</option>
                      </select>
                        {watch(`sessions.${index}.mode`) === 'Présentiel' && (
                    <div>
                      <label className="block mb-1 text-sm">Lieu :</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border rounded text-sm" 
                        {...register(`sessions.${index}.lieu`)} 
                      />
                    </div>
                  )}
                    </div>

                  
                    <div>
                      <label className="block mb-1 text-sm">Type :</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
                        {...register(`sessions.${index}.type_session`)} 
                      >
                        <option value="inter-entreprise">Normale</option>
                        <option value="intra-entreprise">Professionelle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">Genre :</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
                        {...register(`sessions.${index}.genre`)} 
                      >
                        <option value="normal">intra-entreprise</option>
                        <option value="professionnel">inter-entreprise</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Participants :</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border rounded text-sm" 
                        {...register(`sessions.${index}.nb_participants`, { 
                          required: true, 
                          valueAsNumber: true 
                        })} 
                        min="0"
                      />
                    </div> </div>

                  {/* Fichier */}
                  <div>
                    <label className="block mb-1 text-sm">Fiche programme :</label>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="w-full p-1 border rounded text-sm" 
                      onChange={(e) => setValue(`sessions.${index}.fiche_programme`, e.target.files?.[0])} 
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-sm">Cours session :</label>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      className="w-full p-1 border rounded text-sm" 
                      onChange={(e) => setValue(`sessions.${index}.cours_session`, e.target.files?.[0])} 
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >  Supprimer cette session </button>
                    
                    {index > 0 && (
                      <span className="text-xs text-gray-500">
                        Cliquez sur l'en-tête pour replier
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Footer fixe */}
      <div className="p-4 border-t bg-white sticky bottom-0">
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            form="hook-form"
            className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700"
          >
            Enregistrer la formation
          </button>
        </div>
      </div>
    </div>
  </div>
);
}

export default AddFormation;
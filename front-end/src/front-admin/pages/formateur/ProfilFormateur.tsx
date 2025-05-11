import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuthAdmin";
interface DomaineTheme {
  domaine: string;
  theme: string[];
}
interface FichePrg {
  id_fichePrg: number;
  chemin: string;
  id_formateur: number;
}

interface CoursSession {
  id_cours: number;
  chemin: string;
  id_formateur: number;
}
interface Formateur {
  id_formateur: number;
  nom_complet: string;
  mail: string;
  adr: string;
  domaine_de_competences: string[]; // Changer en tableau
  themes_a_enseigner: string[];
  tarif_journalier: number;
  nb_formations: number;
  tel: string;
  niveau_etude: string;
  nb_experience:number;
  horraire_jour:string;
  nom_banque:string;
  RIB:string;
  domaine_assistance:string;
  cv: string | null;
 fichePrg: FichePrg[];
  coursSession: CoursSession[];
  retour_sacConsulting: string;
}


const ProfilFormateur: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [domainesThemes, setDomainesThemes] = useState<{ [key: string]: string[] }>({});
  const [formateur, setFormateur] = useState<Formateur | null>(null);
  const [isEditing, setIsEditing] = useState(new URLSearchParams(location.search).get("mode") === "edit");
  const [updatedFormateur, setUpdatedFormateur] = useState<Formateur | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coursSessionFiles, setCoursSessionFiles] = useState<File[]>([]);
  const [fichePrgFiles, setFichePrgFiles] = useState<File[]>([]);
  const [fichePrgToDelete, setFichePrgToDelete] = useState<string[]>([]); 
  const [coursSessionToDelete, setCoursSessionToDelete] = useState<string[]>([]); // Pour stocker les fiches sélectionnées à supprimer
  const [error, setError] = useState<string | null>(null);
  const [isLoading] = useState(false);
  const { user } = useAuth(); 
  const canEdit = user?.nom_acces === "super_admin" || user?.nom_acces === "editeur formateur";
  

   

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
  
    if (type === "cv" && files.length > 0) {
      setCvFile(files[0]); // On prend seulement le premier fichier pour le CV
    } else if (type === "fichePrg" && files.length > 0) {
      setFichePrgFiles((prevFiles) => [...prevFiles, ...files]);
    } else if (type === "coursSession" && files.length > 0) {
      setCoursSessionFiles((prevFiles) => {
        const newFiles = [...prevFiles, ...files];
        console.log('Fichiers coursSession après ajout :', newFiles);
        return newFiles;
      });
    }
  };
  

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs/${id}`)
      .then((response) => {
        const formateurData = response.data;

      // S'assurer que domaine_de_competences est un tableau
      
      setFormateur({
        ...formateurData,
          });
      setUpdatedFormateur({
        ...formateurData,
          });
    })
      .catch((error) => console.error("Erreur lors de la récupération du formateur:", error));
  }, [id]);

  useEffect(() => {
    // Appel à l'API pour récupérer les domaines et thèmes associés
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaine-themes`)
      .then(response => {
        setDomainesThemes(response.data); // Réponse au format { domaine: [theme1, theme2, ...] }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des domaines et thèmes :", error);
      });
  }, []);
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
  
    setUpdatedFormateur({ ...updatedFormateur, [name]: selectedValues });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (updatedFormateur) {
      setUpdatedFormateur({ ...updatedFormateur, [e.target.name]: e.target.value });
    }
  };
  
  const handleFichePrgDelete = (fiche: FichePrg) => {
    setFichePrgToDelete((prev) => {
      if (prev.includes(fiche.chemin)) {
        return prev.filter((item) => item !== fiche.chemin); // Retirer la fiche de la suppression si elle est déjà sélectionnée
      }
      return [...prev, fiche.chemin]; // Ajouter la fiche à la liste des fiches à supprimer
    });
  };
  const handleCoursSessionDelete = (cours: CoursSession) => {
    setCoursSessionToDelete((prev) => {
      if (prev.includes(cours.chemin)) {
        return prev.filter((item) => item !== cours.chemin); // Retirer la fiche de la suppression si elle est déjà sélectionnée
      }
      return [...prev, cours.chemin]; // Ajouter la fiche à la liste des fiches à supprimer
    });
  };
  const handleSave = async () => {
    const formData = new FormData();
  
    Object.keys(updatedFormateur).forEach(key => {
      const value = updatedFormateur[key];
    
      // Check if value is null or undefined
      if (value == null) {
        return; // Skip this iteration if the value is null or undefined
      }
    
      if (value.length === 0 && (key === 'domaine_de_competences' || key === 'themes_a_enseigner')) {
        formData.append(key, JSON.stringify(value)); 
      } else {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, value);
        }
      }
    });
    
    // Ajouter les fichiers (photo, CV, fiches de programme)
    if (cvFile) formData.append("cv", cvFile);
  
    fichePrgFiles.forEach((file) => {
      formData.append("fichePrg", file); // Utilisez un tableau de noms génériques
    });
    coursSessionFiles.forEach((file) => {
      formData.append("coursSession", file);

    });
    fichePrgToDelete.forEach((fiche) => {
      formData.append("fichePrgToDelete", fiche);
    });
    coursSessionToDelete.forEach((cours) => {
      formData.append("coursSessionToDelete", cours);
    });
    // Afficher le contenu de FormData pour débogage
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    // Demander à l'utilisateur s'il veut supprimer les anciennes fiches
    if (fichePrgToDelete.length > 0) {
      const deleteFiches = window.confirm("Souhaitez-vous supprimer les anciennes fiches de programme ?");
      if (deleteFiches) {
        formData.append("deleteFiches", "true");
      }
    }
    if (coursSessionToDelete.length > 0) {
      const deleteCours = window.confirm("Souhaitez-vous supprimer les anciens cours de session ?");
      if (deleteCours) {
        formData.append("deleteCours", "true");
      }
    }
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    // Envoyer la requête PUT au serveur
    try {
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setIsEditing(false);
    setError(null);
    setFichePrgFiles([]);
    setCoursSessionFiles([]);
    setFichePrgToDelete([]);
    setCoursSessionToDelete([]);

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs/${id}`);
      setFormateur(response.data);
      setUpdatedFormateur(response.data);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError("Une erreur s'est produite pendant la mise à jour.");
    }
  };
  
  if (!formateur) {
    return <p className="text-center mt-8 text-gray-600">Chargement des informations...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 bg-white shadow-lg p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Fiche du Formateur</h2>

     
      <div className="grid grid-cols-2 gap-4 bg-gray-200 marge-10  p-6 w-full mb-6">
        <p className="font-semibold">CV:</p>
        {formateur.cv ? (
          <a 
          href={`${import.meta.env.VITE_APP_API_URL}/uploads/${formateur.cv}`}
          target="_blank" 
          rel="noopener noreferrer"
           className="text-blue-600 underline">
          Télécharger le CV
        </a>
        
        ) : (
          <p className="text-gray-600">Aucun CV disponible</p>
        )}
        {isEditing && (
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'cv')}
            accept=".pdf"
            className="mt-2 p-2 border rounded"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-200 marge-10  p-6 w-full mb-6">
        <p className="font-semibold">Fiches programme :</p>
        {formateur.fichePrg && formateur.fichePrg.length > 0 ? (
          <ul className="mt-2">
            {formateur.fichePrg.map((fiche, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  onChange={() => handleFichePrgDelete(fiche)}
                  checked={fichePrgToDelete.includes(fiche.chemin)}
                />
                <span>{`Fiche ${index + 1}: `}</span>
                <a href={`${import.meta.env.VITE_APP_API_URL}/uploads/${fiche.chemin}`} 
                target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Télécharger la fiche {index + 1}
                </a>
              </div>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Aucune fiche programme disponible</p>
        )}

        
      </div>

      <div className="grid grid-cols-2 gap-4 bg-gray-200 marge-10  p-6 w-full mb-6">
        <p className="font-semibold">Cours de session:</p>
        {formateur.coursSession && formateur.coursSession.length > 0 ? (
          <ul className="mt-2">
            {formateur.coursSession.map((cours, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  onChange={() => handleCoursSessionDelete(cours)}
                  checked={coursSessionToDelete.includes(cours.chemin)}
                />
                <span>{`Fiche ${index + 1}: `}</span>
                <a href={`${import.meta.env.VITE_APP_API_URL}/uploads/${cours.chemin}`}
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-blue-600 underline">
                  Télécharger le cours{index + 1}
                </a>
              </div>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Aucune cours disponible</p>
        )}

       
      </div>


      {/* Formulaire */}
      <div className="grid grid-cols-2 gap-4  bg-gray-200 marge-10  p-6 w-full mb-6">
        <div className=" grid bg-gray-100 marge-6  p-6 w-full mb-10">
          <p className="font-semibold">Nom complet:</p>
          {isEditing ? (
            <input
              type="text"
              name="nom_complet"
              value={updatedFormateur?.nom_complet || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.nom_complet}</p>
          )}
        </div>
        

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold">Email:</p>
          {isEditing ? (
            <input
              type="email"
              name="mail"
              value={updatedFormateur?.mail || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
           
            <p>{formateur.mail}</p>
          )}
        </div>

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Adresse:</p>
          {isEditing ? (
            <input
              type="text"
              name="adr"
              value={updatedFormateur?.adr || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.adr}</p>
          )}
        </div>

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Téléphone:</p>
          {isEditing ? (
            <input
              type="tel"
              name="tel"
              value={updatedFormateur?.tel || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.tel}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold "> Niveau d'Etude:</p>
          {isEditing ? (
            <textarea
              name="niveau_etude"
              value={updatedFormateur?.niveau_etude || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.niveau_etude}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Domaine de Compétences:</p>
          {isEditing ? (
            <select
            name="domaine_de_competences"
            value={updatedFormateur?.domaine_de_competences }
            onChange={handleMultiSelectChange}
            multiple
            className="w-full p-2 border rounded"
          >
             <option value="">Sélectionner un domaine</option>
             {Object.keys(domainesThemes).map((domaine) => (
              <option key={domaine} value={domaine}>{domaine}</option>
            ))}
          </select>
      ) : (
        <p>{formateur.domaine_de_competences}</p>
      )}
    </div >
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Domaine de Compétences au niveau d'assistance:</p>
          {isEditing ? (
            <textarea
              name="domaine_assistance"
              value={updatedFormateur?.domaine_assistance || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.domaine_assistance}</p>
          )}
        </div>

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Thèmes à enseigner:</p>
          {isEditing ? (
            <select
            name="themes_a_enseigner"
            value={updatedFormateur?.themes_a_enseigner }
            onChange={handleMultiSelectChange}
            multiple
            className="w-full p-2 border rounded"
          >
               <option value="">Sélectionner un thème</option>
               {Object.keys(domainesThemes).map((domaine) => (
              domainesThemes[domaine].map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))
            ))}
          </select>
      ) : (
        <p>{formateur.themes_a_enseigner}</p>
      )}
    </div>

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Tarif journalier:</p>
          {isEditing ? (
            <input
              type="text"
              name="tarif_journalier"
              value={updatedFormateur?.tarif_journalier || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.tarif_journalier} TND</p>
          )}
        </div>

        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold">Nombre de formations:</p>
          {isEditing ? (
            <input
              type="text"
              name="nb_formations"
              value={updatedFormateur?.nb_formations || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.nb_formations}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Nombre d'Experiences:</p>
          {isEditing ? (
            <input
              type="text"
              name="nb_experience"
              value={updatedFormateur?.nb_experience || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.nb_experience}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Horraire par jour:</p>
          {isEditing ? (
            <input
              type="text"
              name="horraire_jour"
              value={updatedFormateur?.horraire_jour || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.horraire_jour}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Nom du Banque:</p>
          {isEditing ? (
            <input
              type="text"
              name="nom_banque"
              value={updatedFormateur?.nom_banque || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.nom_banque}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">RIB du Banque:</p>
          {isEditing ? (
            <input
              type="text"
              name="RIB"
              value={updatedFormateur?.RIB || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.RIB}</p>
          )}
        </div>
        <div className="grid bg-gray-100 marge-6  p-6 w-full mb-6">
          <p className="font-semibold ">Retour de l'entreprise :</p>
          {isEditing ? (
            <input
              type="text"
              name="retour_sacConsulting"
              value={updatedFormateur?.retour_sacConsulting || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <p>{formateur.retour_sacConsulting}</p>
          )}
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-6 flex gap-4">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-300"
              onClick={() => {
                setIsEditing(false);
                navigate(location.pathname);
              }}
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            className={`px-4 py-2 rounded-lg text-white ${canEdit ? "bg-teal-500 hover:bg-teal-700" : "bg-gray-400 cursor-not-allowed"}`}
            onClick={() => {
              if (canEdit) {
                setIsEditing(true);
                navigate(`${location.pathname}?mode=edit`);
              } else {
                setError("Vous n'avez pas l'accès pour modifier ce formateur.");
              }
            }}
          >
            Modifier
          </button>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default ProfilFormateur;
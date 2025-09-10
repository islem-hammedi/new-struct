import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import AddFormation from "./AddFormation";
import UpdateFormation from "../formation/UpdateFormation";
import Avis from "../avisParticipant";
import AvisFormateur from "../avisFormateur";
import { useNavigate, useParams } from "react-router-dom";
import { FaFilePdf, FaDownload, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

interface Session {
  id_session: number;
  theme: string;
  code: string;
  nb_participants:string; 
  etat: string;
  type_session: string;
  lieu:string;
  formateur: string;
  fiche_prg: string;
  cours_session: string;
  id_formateur: number;
  mode:string;
  genre: string;
  duree: string;
  date_debut: Date;
  date_fin: Date;
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
interface Avis {
  id_avis: number;
  id_participant: number;
  id_session: number;
  commentaire: string;
  date_creation: string;
  adaptation_programme_vie_pro: number;
  moyens_pedagogiques_utilises: number;
  convenance_horaires_formation: number;
  apports_niveau_professionnel: number;
  qualite_documentation_distribuee: number;
  maitrise_globale_sujets_presentes: number;
  traitement_exemples_travail: number;
  animations_seances: number;
  homogeneite_groupe: number;
  satisfaction_attentes: number;
  duree_formation: number;
}
interface AvisFormateur {
  id_avis: number;
  date_creation: string; 
  nom_formateur: string;
  nom_participant: string;
  observation: string; 
  connaissances_professionnelles: number;
  connaissances_equipements: number; 
  comprehension_competences: number; 
  aptitude_appliquer_infos: number;
  rapidite_execution: number; 
  qualite_travaux: number;
  clarte_pertinence_resultats: number; 
  perfectionnement_connaissances: number;
  respect_consignes_constructeur: number;
  respect_normes_securite: number;
  autonomie_travail: number; 
  participation: number;
  assiduite_ponctualite: number; 
  initiative: number;
  esprit_groupe: number; 
}

const FormationsList: React.FC = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddFormation, setShowAddFormation] = useState(false);

  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showSessionSearch, setShowSessionSearch] = useState<{ [key: string]: boolean }>({});
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  
  const [isAvispOpen, setIsAvispOpen] = useState(false);
  const [isAvisfOpen, setIsAvisfOpen] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number>(1);
  
  const [avisP, setAvisP] = useState<any[]>([]);  
  const [avisF,setAvisF]= useState<any[]>([]);

  useEffect(() => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => {
        setFilteredFormations(response.data);
        setFormations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        setFormateurs(response.data);
        console.log("Formateurs récupérés :", response.data);
      })
      .catch((err) => console.error("Erreur lors de la récupération des formateurs", err));
  }, []);

  const refreshFormations = () => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`)
      .then((response) => setFilteredFormations(response.data))
      .catch((err) => console.error("Erreur lors de la mise à jour des formations", err));
  };

  const domainesUniques = Array.from(new Set(filteredFormations.map((f) => f.domaine)));
  const domainesFiltres = domainesUniques.filter((domaine) =>
    (domaine ? domaine.toLowerCase() : ''));

  const handleSearchToggle = () => setShowSearchBar(!showSearchBar);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredFormations(formations);
      return;
    }
    const filtered = filteredFormations.filter((formation) => {
      const matchesDomaine =formation.domaine ? formation.domaine.toLowerCase().includes(query):false;
      console.log("Formation:", formation.domaine, "Matches Domaine:", matchesDomaine);
      const matchesSession = formation.sessions.some((session) => {
        return (
          (session.theme?session.theme.toLowerCase().includes(query):false) ||
          (session.code?session.code.toLowerCase().includes(query):false) ||
          (session.type_session ? session.type_session.toLowerCase().includes(query):false) ||
          (session.formateur ? session.formateur.toLowerCase().includes(query):false) ||
          (session.mode ? session.mode.toLowerCase().includes(query):false) ||
          (session.genre ? session.genre.toLowerCase().includes(query):false) ||
          (session.etat? session.etat.toLowerCase().includes(query):false) 

         );
      });
      console.log("Formations:", filteredFormations);
      console.log("Search Query:", query);
      console.log("Query:", query);
      return matchesDomaine || matchesSession;
    });
  
    setFilteredFormations(filtered);
    console.log("Filtered Formations:", filtered);

  };
    const renderFileLink = (filename: string | null, label: string) => {
    if (!filename) return <span className="text-gray-400">Non disponible</span>;
    
    return (
      <a 
        href={`${import.meta.env.VITE_APP_API_URL}/uploads/${filename}`} 
        download
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:text-teal-800 flex items-center"
      >
        <FaFilePdf className="mr-1" />
        {label}
        <FaDownload className="ml-1 text-sm" />
      </a>
    );
  };
  const handleSessionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSessionSearchQuery(e.target.value);

  const toggleSessionSearch = (domaine: string) => {
    setShowSessionSearch((prevState) => ({
      ...prevState,
      [domaine]: !prevState[domaine],
    }));
  };

  const handleDeleteFormation = async (id_formation: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une formation.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) {
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/DEL/${id_formation}`);
      console.log("Suppression réussie:", response.data);

      setFilteredFormations((prevFormations) =>
        prevFormations.filter((filteredFormations) => filteredFormations.id_formation !== id_formation)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors de la suppression de la formation:", error.response?.data || error.message);
      } else {
        console.error("Erreur lors de la suppression de la formation:", error);
      }
    }
    refreshFormations();
  };

  const handleDeleteSession = async (formationId: number, sessionId: number) => {
    if (user.nom_acces !== "super_admin" && user.nom_acces !== "gestionnaire formation") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer une session.");
      return;
    }
    if (!window.confirm("Voulez-vous vraiment supprimer cette session ?")) {
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/${formationId}/sessions/${sessionId}`);
      setFilteredFormations((prevFormations) =>
        prevFormations.map((formation) =>
          formation.id_formation === formationId
            ? { ...formation, sessions: formation.sessions.filter((session) => session.id_session !== sessionId) }
            : formation
        )
      );
    } catch (error) {
      console.error("Erreur suppression session:", axios.isAxiosError(error) ? error.response?.data || error.message : error);
    }
    refreshFormations();
  };

  const handleEditFormation = (formation: Formation) => {
    setEditingFormation(formation);
  };

  const handleUpdateFormation = () => {
    setEditingFormation(null);
    refreshFormations();
  };

  const fetchAvis = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/avisP/${sessionId}`); 
      setAvisP(response.data); 
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false); 
    }
  };
  const fetchAvisf = async (sessionId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/avis/avisF/${sessionId}`); 
      setAvisF(response.data); 
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false); 
    }
  };

  const handleViewAvisParticipants = (sessionId: number) => {
    setSessionId(sessionId);
    setIsAvispOpen(true);
    fetchAvis(sessionId); 
  };
  
  const handleViewAvisFormateurs = (sessionId: number) => {
    setSessionId(sessionId);
    setIsAvisfOpen(true);
    fetchAvisf(sessionId); 
  };
  



  const getFormateurName = (session: Session) => {
    
    if (!formateurs.length) {
      return "Chargement formateur...";
    }
    if (session.id_formateur === undefined) {
      console.error("id_formateur est undefined pour la session :", session);
      return "Inconnu";
    }
    console.log(`Session ID: ${session.id_session}, Formateur ID: ${session.id_formateur}`);
    const formateur = formateurs.find((f) => f.id_formateur === Number(session.id_formateur));
    console.log(`Formateur trouvé: ${formateur ? formateur.nom_complet : "Aucun"}`);
    return formateur?.nom_complet ? formateur.nom_complet : "Inconnu";
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;


  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation ? (
        <UpdateFormation
          formation={editingFormation}
          onUpdate={handleUpdateFormation}
          onCancel={() => setEditingFormation(null)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Formations</h1>
            <button onClick={handleSearchToggle} className="bg-white text-[#82b89a] p-2 rounded-full shadow hover:text-black">
              🔍
            </button>
           
          </div>
          
          {showSearchBar && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
              <input
                type="text"
                placeholder="Rechercher une formation ou un thème..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
              />
            </motion.div>
            
          )}
      {loading && <p className="text-center text-gray-500">Chargement...</p>}
      {error && <p className="text-center text-red-600 font-bold">{error}</p>}

            <div className="flex justify-end p-4">
              <button
                onClick={() => setShowAddFormation(true)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg"
               >
                + Planifier Formation ?
              </button>
            </div>
            {showAddFormation && (
              <AddFormation onFormationAdded={refreshFormations} onClose={() => setShowAddFormation(false)}  />)
            }

            

          {filteredFormations.length === 0 ? (
            <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
          ) : (

                Array.from(new Set(filteredFormations.map((f) => f.domaine))).map((domaine) => {
                const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine && f.sessions.length > 0);
                return (
                  
                <div key={domaine} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xl font-semibold text-teal-700">{domaine}</h3>
                  </div>
                 
                  <div className="space-y-4">
                    {formationsDuDomaine.map((formation) => (
                      <div 
                        key={formation.id_formation} 
                        className="bg-gray-100 shadow-md rounded-lg p-12 border border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() => setSelectedFormationId(selectedFormationId === formation.id_formation ? null : formation.id_formation)}
                      >
                        <div className="space-y-3">
                          {formation.sessions.map((session) => (
                            <div key={session.id_session} className="flex justify-between items-center">
                              <h5 className="font-medium flex-grow">{session.theme}</h5>
                              <div className="flex space-x-2 ml-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleEditFormation(formation);
                                  }} 
                                  className="text-teal-500 hover:text-teal-700 whitespace-nowrap">
                                  éditer ✏️
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSession(formation.id_formation, session.id_session);
                                  }}
                                  className="text-red-500 hover:text-red-700 whitespace-nowrap">
                                  supprimer 🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                         {selectedFormationId === formation.id_formation && (
                          <>
                            {formation.sessions.length > 0 ? (
                              
                             <div className="overflow-x-auto">

                              <table className="w-full mt-4 border-collapse min-w-[1100px] border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2">Thème/Code</th>
                                    <th className="border border-gray-300 px-4 py-2">Formateur</th>
                                    <th className="border border-gray-300 px-4 py-2">Fichiers</th>

                                    <th className="border border-gray-300 px-4 py-2">etat</th>
                                    <th className="border border-gray-300 px-4 py-2">Type</th>
                                    <th className="border border-gray-300 px-4 py-2">nombre de participants</th>
                                    <th className="border border-gray-300 px-4 py-2">Mode</th>
                                    <th className="border border-gray-300 px-4 py-2">Genre</th>
                                    <th className="border border-gray-300 px-4 py-2">Dates/Durée</th>
                                    <th className="border border-gray-300 px-4 py-2">Avis</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {formation.sessions
                                  .map((session) => (
                                    <tr key={session.id_session} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-2">{session.theme}/{session.code}</td>
                                    <td className="border border-gray-300 px-4 py-2">{getFormateurName(session)}</td>
                                    <td className="border border-gray-300 px-4 py-2"><div className="space-y-2">
                                    {renderFileLink(session.fiche_prg, "Programme")}
                                    {renderFileLink(session.cours_session, "Support")}</div></td>

                                    <td className="border border-gray-300 px-4 py-2">{session.etat}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.type_session} à {session.lieu} </td>
                                    <td className="border border-gray-300 px-4 py-2">{session.nb_participants}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.mode}</td>
                                    <td className="border border-gray-300 px-4 py-2">{session.genre}</td>
                                    <td className="border border-gray-300 px-4 py-2"> début: {session.date_debut ? new Date(session.date_debut).toLocaleDateString() : ''} Fin: {session.date_fin ? new Date(session.date_fin).toLocaleDateString() : ''} durée:{session.duree}</td>

                                    <td className="border border-gray-300 px-4 py-2">
                                        {session.etat === "déjà réalisé" && (
                                          <>
                                              <button onClick={() => handleViewAvisParticipants(1)}  className="text-teal-500">
                                                avis participants 🌟 </button>
                                              {isAvispOpen && loading && <p>Chargement...</p>} 
                                              {isAvispOpen && error && <p>{error}</p>}
                                              {isAvispOpen && !loading && (
                                              <Avis avisList={avisP}  loading={loading}  error={error}  onClose={() => setIsAvispOpen(false)} />
                                              )}
                                         
                                           <button onClick={() => handleViewAvisFormateurs(1)} className="text-teal-500">
                                             avis Formateur 🌟 </button>
                                           {isAvisfOpen && loading && <p>Chargement...</p>} 
                                           {isAvisfOpen && error && <p>{error}</p>}
                                           {isAvisfOpen && !loading && (
                                           <AvisFormateur avisList={avisF}  loading={loading}  error={error}  onClose={() => setIsAvisfOpen(false)} />
                                           )}
                                       </>
                                        )}
                                    </td>
                                  </tr>
                                   ))}
                                  {isAvispOpen && <Avis avisList={avisP}  loading={loading}  error={error} onClose={() => setIsAvispOpen(false)} />}
                                  {isAvisfOpen && <AvisFormateur avisList={avisF}  loading={loading}  error={error} onClose={() => setIsAvisfOpen(false)} />}

                                </tbody>
                              </table></div>
                            ) : (
                              <p>Aucune session disponible.</p>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};
export default FormationsList;
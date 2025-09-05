{/*import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import AddDomaine from "./AddDomain";
import AddTheme from "./AddTheme.tsx";
import EditDomaine from "../catalogue/UpdateCatalogue";
import { useNavigate, useParams } from "react-router-dom";

interface Session {
    id_theme: number;
    theme: string;
    code: string;
    
    formateurs: Formateur[];
  }

interface Catalogue {
  id_formation: number;
  domaine: string;
  sessions: Session[];}

interface Formateur {
    id_formateur: number;
    nom_complet: string;
    domaine_de_competences: string;
    themes_a_enseigner: Record<string, number> | null;
    mail?: string;
    adr?: string;
    tarif_journalier?: number;
    tel?: string;
    cv?: string;
    niveau_etude?: string;
    nb_experience?: number;
    fiche_prg?: string;
    cours: string;
    rang?: number; 
  }

const CatalogueListAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Catalogue[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showAddTheme, setShowAddTheme] = useState<boolean>(false);
  const [selectedDomain, setSelectedDomain] = useState<{ domaine: string } | null>(null);
  const [domaineFromButton, setdomaineFromButton] = useState<string>('');

  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [selectedDomaine, setSelectedDomaine] = useState<Catalogue | null>(null);
  const [selectedDomaineId, setSelectedDomaineId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showSessionSearch, setShowSessionSearch] = useState<{ [key: string]: boolean }>({});
  const [filteredFormations, setFilteredFormations] = useState<Catalogue[]>([]);
  const [showModal, setShowModal] = useState(false);

  
  
  const handleEditDomaine = (domaine: Catalogue, id_formation: number) => {
    setSelectedDomaine(domaine);
    setSelectedDomaineId(id_formation);
    setShowEditModal(true);
  };

  const handleClose = () => {
    setShowEditModal(false);
  };
  
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catalogueResponse, formateursResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`),
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
        ]);
        const formattedData = catalogueResponse.data.map((domaine: any) => ({
          ...domaine,
          sessions: domaine.sessions || [] // Ensure sessions exists
        }));
        setFilteredFormations(catalogueResponse.data);
        setFormations(catalogueResponse.data);
        setFormateurs(formateursResponse.data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

   useEffect(() => {
    if (!user) return; // Vérifie si l'utilisateur est connecté

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        const sortedFormateurs = response.data.sort((a: Formateur, b: Formateur) => b.id_formateur - a.id_formateur);
        setFormateurs(sortedFormateurs);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des formateurs:", error.response?.data || error.message);
      });
  }, [user]);

  const refreshFormations = () => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`)
      .then((response) => setFilteredFormations(response.data))
      .catch((err) => console.error("Erreur lors de la mise à jour des formations", err));
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`)
      .then((response) => setFormations(response.data) )
      .catch((err) => console.error("Erreur lors de la mise à jour du catalogue", err));
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => setFormateurs(response.data) )
      .catch((err) => console.error("Erreur lors de la mise à jour des formateurs", err));

  };
  const handleShowFormateurDetails = (formateur: Formateur) => {
    setSelectedFormateur(formateur);
  };

  const handleCloseFormateurDetails = () => {
    setSelectedFormateur(null);
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
          (session.formateurs ? session.formateurs.some(formateur => formateur.nom_complet.toLowerCase().includes(query)) : false) 

         );
      });
      return matchesDomaine || matchesSession;
    });
  
    setFilteredFormations(filtered);
    console.log("Filtered Formations:", filtered);

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
    if (user.nom_acces !== "super_admin") {
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
            ? { ...formation, sessions: formation.sessions.filter((session) => session.id_theme !== sessionId) }
            : formation
        )
      );
    } catch (error) {
      console.error("Erreur suppression session:", axios.isAxiosError(error) ? error.response?.data || error.message : error);
    }
    refreshFormations();
  };

 
   const [editingFormation, setEditingFormation] = useState<Catalogue | null>(null);
 
  const handleEditFormation = (formation: Catalogue) => {
    setEditingFormation(formation);
  };
  
  const handleUpdateFormation = () => {
    setEditingFormation(null);
    refreshFormations();
  };


 
  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation ? (
        <EditDomaine
          domaineId={editingFormation?.id_formation}
          formation={editingFormation}
          onClose={() => setEditingFormation(null)}
          onUpdate={handleUpdateFormation}
          onCancel={() => setEditingFormation(null)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Catalogue</h1>
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
              onClick={() => setShowAddDomain(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg"
            >
              + Nouveau Domaine ?
            </button>
          </div>
          {showAddDomain && (
              <AddDomaine onFormationAdded={refreshFormations} onClose={() => setShowAddDomain(false)}  />
            )}

          {filteredFormations.length === 0 ? (
            <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
          ) : (
            Array.from(new Set(filteredFormations.map((f) => f.domaine))).map((domaine) => {
              const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine);
              return (
                <div key={domaine} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-teal-700">{domaine}</h3>
                    <div className="flex justify-end p-4">
                      <button
                        onClick={() => {setShowAddTheme(true);
                        setSelectedDomain({ domaine});
                        setdomaineFromButton(domaine);
                      }}
                        className="bg-white text-teal-600 px-4 py-2 rounded-lg"
                      >
                        + Nouveau Thème ?
                      </button>
                    </div>
                    {showAddTheme && (
                        <AddTheme 
                          onFormationAdded={refreshFormations} 
                          onClose={() => setShowAddTheme(false)} 
                          domaineFromButton={domaineFromButton }
                          selectedDomain={ selectedDomain } 
                        />
                      )}
                  </div>
                  <button onClick={() => toggleSessionSearch(domaine)} className="text-teal-600 font-semibold">
                    Rechercher thèmes...
                  </button>

                  {showSessionSearch[domaine] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
                      <input
                        type="text"
                        placeholder="Rechercher un thème..."
                        value={sessionSearchQuery}
                        onChange={handleSessionSearchChange}
                        className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-2 ">
                  {formationsDuDomaine.map((formation) => (
                      <div
                        key={formation.id_formation}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          setSelectedFormationId(
                            selectedFormationId === formation.id_formation ? null : formation.id_formation
                          )
                        }
                      >
                    <div>
                      {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                          <div className="flex justify-end p-4">
                             <button 
                              onClick={() => handleEditDomaine(formation, formation.id_formation)}
                              className="text-teal-700 mr-2"
                            >
                              éditer ✏️
                            </button>

                            {showEditModal && selectedDomaine && selectedDomaineId && (
                              <EditDomaine 
                                domaineId={selectedDomaineId} 
                                onClose={handleClose}
                                onUpdate={refreshFormations}
                                formation={selectedDomaine}
                              />
                            )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFormation(formationsDuDomaine[0].id_formation);
                          }}
                          className="text-red-500 mr-2"
                        >
                          supprimer 🗑️
                        </button>
                      </div> 
                    )}
                        <div className="flex justify-between items-center ">
                          <div>
                            <h4 className="font-medium">{formation.domaine}</h4>
                            {formation.sessions && formation.sessions.map((session) => (
                              <div key={session.id_theme}>
                                <h5 className="font-medium ">{session.theme}</h5>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="max-w-4xl mx-auto p-4">
                                              {selectedFormateur && (
                                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                                  <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                                    <h2 className="text-xl font-bold mb-4">Détails du formateur</h2>
                                                    <div className="grid grid-cols-2 gap-4">
                                                      <div>
                                                        <p><span className="font-semibold">Nom:</span> {selectedFormateur.nom_complet}</p>
                                                        <p><span className="font-semibold">Email:</span> {selectedFormateur.mail}</p>
                                                        <p><span className="font-semibold">Téléphone:</span> {selectedFormateur.tel}</p>
                                                        <p><span className="font-semibold">Adresse:</span> {selectedFormateur.adr}</p>
                                                        
                    
                                                      </div>
                                                      <div>
                                                        <p><span className="font-semibold">Domaine de compétences:</span> {selectedFormateur.domaine_de_competences}</p>
                                                        <p><span className="font-semibold">Thèmes enseignés:</span> {selectedFormateur.themes_a_enseigner ? Object.keys(selectedFormateur.themes_a_enseigner).join(', ') : 'N/A'}</p>
                                                        <p><span className="font-semibold">Tarif journalier:</span> {selectedFormateur.tarif_journalier}</p>
                                                        <p><span className="font-semibold">Niveau d'étude:</span> {selectedFormateur.niveau_etude}</p>
                                                        <p><span className="font-semibold">fiche programme:</span> {selectedFormateur.fiche_prg}</p>
                                                        <p><span className="font-semibold">cours session:</span> {selectedFormateur.cours}</p>
                                                        <p><span className="font-semibold">cv formateur:</span> {selectedFormateur.cv}</p>
                    
                                                      </div>
                                                    </div>
                                                    <button 
                                                      onClick={handleCloseFormateurDetails}
                                                      className="mt-4 bg-teal-500 text-white px-4 py-2 rounded-lg"
                                                    >
                                                      Fermer
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                      
                          {selectedFormationId === formation.id_formation && (
                            <>
                              {formation.sessions.length > 0 ? (
                                <table className="w-full mt-4 border-collapse border border-gray-300">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-300 px-4 py-2">Thème</th>
                                      <th className="border border-gray-300 px-4 py-2">Code</th>
                                      <th className="border border-gray-300 px-4 py-2">Formateurs</th>
                                      <th className="border border-gray-300 px-4 py-2">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formation.sessions.map((session) => (
                                      <tr key={session.id_theme} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{session.theme}</td>
                                        <td className="border border-gray-300 px-4 py-2">{session.code}</td>

                                        <td className="border border-gray-300 px-4 py-2">
                                        {session.formateurs?.length > 0 ? (
                                          session.formateurs.map((formateur) => (
                                            <div key={formateur.id_formateur} className="text-teal-600 hover:text-teal-800 cursor-pointer underline" onClick={() => handleShowFormateurDetails(formateur)}>
                                             {formateur.rang}: {formateur.nom_complet} 
                                            </div>
                                          ))
                                        ) : (
                                          <span className="text-gray-500">Aucun formateur</span>
                                        )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                          <>
                                            
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditFormation(formation);
                                              }}
                                              className="text-teal-500"
                                            >
                                              éditer ✏️
                                            </button>
                                      
                                          </>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p>Aucune session disponible.</p>
                              )}
                            </>
                          )}
                        </div>
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

export default CatalogueListAdmin;*/}








import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import AddDomaine from "./AddDomain";
import AddTheme from "./AddTheme.tsx";
import EditTheme from "../catalogue/UpdateCatalogue";
import { useNavigate, useParams } from "react-router-dom";

interface Session {
    id_theme: number;
    theme: string;
    code: string;
    
    formateurs: Formateur[];
  }
interface Catalogue {
  id_formation: number;
  domaine: string;
  sessions: Session[];}

interface Formateur {
    id_formateur: number;
    nom_complet: string;
    domaine_de_competences: string;
    themes_a_enseigner: Record<string, number> | null;
    mail?: string;
    adr?: string;
    tarif_journalier?: number;
    tel?: string;
    cv?: string;
    niveau_etude?: string;
    nb_experience?: number;
    fiche_prg?: string;
    cours: string;
    rang?: number; 
  }

const CatalogueListAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState<Catalogue[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showAddTheme, setShowAddTheme] = useState<boolean>(false);
  const [selectedDomain, setSelectedDomain] = useState<{ domaine: string } | null>(null);
  const [domaineFromButton, setdomaineFromButton] = useState<string>('');

  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [selectedDomaine, setSelectedDomaine] = useState<Catalogue | null>(null);
  const [selectedDomaineId, setSelectedDomaineId] = useState<number | null>(null);
    const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);

  
  const [showEditModal, setShowEditModal] = useState(false);

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [showSessionSearch, setShowSessionSearch] = useState<{ [key: string]: boolean }>({});
  const [filteredFormations, setFilteredFormations] = useState<Catalogue[]>([]);
  const [showModal, setShowModal] = useState(false);

  
  
  const handleEditDomaine = (domaine: Catalogue, id_formation: number, id_theme:number) => {
    setSelectedDomaine(domaine);
    setSelectedDomaineId(id_formation);
    setSelectedThemeId(id_theme);
    setShowEditModal(true);
  };

  const handleClose = () => {
    setShowEditModal(false);
  };
  
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catalogueResponse, formateursResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`),
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
        ]);
        const formattedData = catalogueResponse.data.map((domaine: any) => ({
          ...domaine,
          sessions: domaine.sessions || [] // Ensure sessions exists
        }));
        setFilteredFormations(catalogueResponse.data);
        console.log("catalogueResponse",catalogueResponse)
        setFormations(catalogueResponse.data);
        setFormateurs(formateursResponse.data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

   useEffect(() => {
    if (!user) return; // Vérifie si l'utilisateur est connecté

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        const sortedFormateurs = response.data.sort((a: Formateur, b: Formateur) => b.id_formateur - a.id_formateur);
        setFormateurs(sortedFormateurs);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des formateurs:", error.response?.data || error.message);
      });
  }, [user]);

  const refreshFormations = () => {
    axios
    .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`)
      .then((response) => setFilteredFormations(response.data))
      .catch((err) => console.error("Erreur lors de la mise à jour des formations", err));
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue`)
      .then((response) => setFormations(response.data) )
      .catch((err) => console.error("Erreur lors de la mise à jour du catalogue", err));
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => setFormateurs(response.data) )
      .catch((err) => console.error("Erreur lors de la mise à jour des formateurs", err));

  };
  const handleShowFormateurDetails = (formateur: Formateur) => {
    setSelectedFormateur(formateur);
  };

  const handleCloseFormateurDetails = () => {
    setSelectedFormateur(null);
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
          (session.formateurs ? session.formateurs.some(formateur => formateur.nom_complet.toLowerCase().includes(query)) : false) 

         );
      });
      return matchesDomaine || matchesSession;
    });
  
    setFilteredFormations(filtered);
    console.log("Filtered Formations:", filtered);

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

  const handleDeleteTheme = async (id_domaine: number, id_theme: number) => {
    try {
      //console.log('Envoi DELETE - Domaine:', id_domaine, 'Thème:', id_theme);
      alert("Voulez-vous vraiment supprimer ce thème ?");
      const response = await axios.delete(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/catalogue/domaine/${id_domaine}/theme/${id_theme}`,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          // Important: accepter 404 comme réponse valide pour mieux gérer l'erreur
          validateStatus: (status) => status < 500 
        }
      );
  
      if (response.status === 200) {
        console.log('Succès:', response.data.message);
        alert("Thème supprimé avec succès !");
        await refreshFormations();
      } else {
        console.warn('Réponse non-200:', response.status, response.data);
        throw new Error(response.data?.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error(
        'Erreur complète:', 
        error.response?.data || error.message
      );
  
    }
  };
 
   const [editingFormation, setEditingFormation] = useState<Catalogue | null>(null);
 
  const handleEditFormation = (formation: Catalogue) => {
    setEditingFormation(formation);
  };
  
  const handleUpdateFormation = () => {
    setEditingFormation(null);
    refreshFormations();
  };

 const handleRowClick = (id: number) => {
    navigate(`/Admin/formateur/${id}`);
  };
 
  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation ? (
        <EditTheme
          domaineId={editingFormation?.id_formation}
          formation={editingFormation}
          onClose={() => setEditingFormation(null)}
          onUpdate={handleUpdateFormation}
          onCancel={() => setEditingFormation(null)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Catalogue</h1>
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
              onClick={() => setShowAddDomain(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg"
            >
              + Nouveau Domaine ?
            </button>
          </div>
          {showAddDomain && (
              <AddDomaine onFormationAdded={refreshFormations} onClose={() => setShowAddDomain(false)}  />
            )}

          {filteredFormations.length === 0 ? (
            <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
          ) : (
            Array.from(new Set(filteredFormations.map((f) => f.domaine))).map((domaine) => {
              const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine);
              return (
                <div key={domaine} className="mb-6">
                  <div className="flex justify-between items-center mb-2">

                    <h3 className="text-xl font-semibold text-teal-700">{domaine}</h3>
                    <div className="flex justify-end p-4">
                      <button
                        onClick={() => {setShowAddTheme(true);
                        setSelectedDomain({ domaine});
                        setdomaineFromButton(domaine);
                      }}
                        className="bg-white text-teal-600 px-4 py-2 rounded-lg"
                      >
                        + Nouveau Thème ?
                      </button>
                    </div>
                    {showAddTheme && (
                        <AddTheme 
                          onFormationAdded={refreshFormations} 
                          onClose={() => setShowAddTheme(false)} 
                          domaineFromButton={domaineFromButton }
                          selectedDomain={ selectedDomain } 
                        />
                      )}
                  </div>
                  <button onClick={() => toggleSessionSearch(domaine)} className="text-teal-600 font-semibold">
                    Rechercher thèmes...
                  </button>

                  {showSessionSearch[domaine] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
                      <input
                        type="text"
                        placeholder="Rechercher un thème..."
                        value={sessionSearchQuery}
                        onChange={handleSessionSearchChange}
                        className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
                      />
                    </motion.div>
                  )}
<div className="space-y-4">
  {formationsDuDomaine.map((formation) =>
    formation.sessions.map((session) => (
      <div
        key={session.id_theme}
        className="bg-gray-100 shadow-md rounded-lg p-8 border border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() =>
          setSelectedFormationId(
            selectedFormationId === session.id_theme ? null : session.id_theme
          )
        }
      >
         {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                          <div className="flex justify-end p-4">
                             <button 
                              onClick={() => handleEditDomaine(formation, formation.id_formation,session.id_theme)}
                              className="text-teal-700 mr-2"
                            >
                              éditer ✏️
                            </button>

                            {showEditModal && selectedDomaine && selectedDomaineId && selectedThemeId && (
                              <EditTheme 
                                domaineId={selectedDomaineId} 
                                onClose={handleClose}
                                onUpdate={refreshFormations}
                                formation={selectedDomaine}
                                themeId={selectedThemeId!}
                                onFormationAdded={refreshFormations}
                              />
                            )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTheme(formation.id_formation, session.id_theme);
                          }}
                          className="text-red-500 mr-2"
                        >
                          supprimer 🗑️
                        </button>
                      </div> 
                    )}
        {/* Affichage du thème */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">{session.theme}</h4>
          </div>
        </div>

        {/* Ouverture du tableau pour ce thème */}
        {selectedFormationId === session.id_theme && (
          <div className="mt-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Thème</th>
                  <th className="border border-gray-300 px-4 py-2">Code</th>
                  <th className="border border-gray-300 px-4 py-2">Formateurs</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{session.theme}</td>
                  <td className="border border-gray-300 px-4 py-2">{session.code}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {session.formateurs?.length > 0 ? (
                      session.formateurs.map((formateur) => (
                        <div
                          key={formateur.id_formateur}
                          className="text-teal-600 hover:text-teal-800 cursor-pointer underline"
                          onClick={(e) => {handleRowClick(formateur.id_formateur)
                           /* e.stopPropagation(); // Empêche la propagation de l'événement
                            handleShowFormateurDetails(formateur);*/
                          }}
                        >
                          {formateur.rang}: {formateur.nom_complet}
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">Aucun formateur</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                     <button 
                              onClick={() => handleEditDomaine(formation, formation.id_formation,session.id_theme)}
                              className="text-teal-700 mr-2"
                            >
                              éditer ✏️
                            </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    ))
  )}
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

export default CatalogueListAdmin;


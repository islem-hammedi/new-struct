import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthAdmin";
import axios from "axios";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import AddFormation from "./AddFormation";
import UpdateFormation from "./UpdateFormation";
import Avis from "../avisParticipant";
import AvisFormateur from "../avisFormateur";
import AvisParticipant from "../avisParticipant";
import { useNavigate, useParams } from "react-router-dom";
import { FaFilePdf, FaDownload, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  id_avis: number; // Identifiant unique de l'avis
  date_creation: string; // Date de création de l'avis
  nom_formateur: string; // Nom du formateur
  nom_participant: string; // Nom du participant
  observation: string; // Observation ou commentaire
  connaissances_professionnelles: number;
  connaissances_equipements: number; 
  comprehension_competences: number; // Note pour la compréhension des compétences
  aptitude_appliquer_infos: number; // Note pour l'aptitude à appliquer les informations
  rapidite_execution: number; // Note pour la rapidité d'exécution
  qualite_travaux: number; // Note pour la qualité des travaux
  clarte_pertinence_resultats: number; // Note pour la clarté et pertinence des résultats
  perfectionnement_connaissances: number; // Note pour le perfectionnement des connaissances
  respect_consignes_constructeur: number; // Note pour le respect des consignes du constructeur
  respect_normes_securite: number; // Note pour le respect des normes de sécurité
  autonomie_travail: number; // Note pour l'autonomie dans le travail
  participation: number; // Note pour la participation
  assiduite_ponctualite: number; // Note pour l'assiduité et ponctualité
  initiative: number; // Note pour l'initiative
  esprit_groupe: number; // Note pour l'esprit de groupe
}

const FormationsList: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null);
  const [showAddFormation, setShowAddFormation] = useState(false);
  const [editingFormation, setEditingFormation] = useState<Formation | null>(null);
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});


  
  const [isAvispOpen, setIsAvispOpen] = useState(false);
  const [isAvisfOpen, setIsAvisfOpen] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number>();
  
  const [avisP, setAvisP] = useState<any[]>([]);  // Etat pour stocker les avis récupérés
  const [avisF,setAvisF]= useState<any[]>([]);
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "0000-00-00 00:00:00") return "Non défini";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formationsRes, formateursRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`),
          axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
        ]);
        
        setFormations(formationsRes.data);
        setFilteredFormations(formationsRes.data);
        setFormateurs(formateursRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    console.log("État editingFormation a changé:", editingFormation);
  }, [editingFormation]);

  const refreshFormations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form`);
      setFormations(response.data);
      setFilteredFormations(response.data);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des formations", err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredFormations(formations);
      return;
    };

    const filtered = formations.filter((formation) => {
      const matchesDomaine = formation.domaine?.toLowerCase().includes(query);
      const matchesSession = formation.sessions.some((session) => (
        session.theme?.toLowerCase().includes(query) ||
        (session.code?.toLowerCase().includes(query)) ||
        (session.type_session?.toLowerCase().includes(query)) ||
        (session.formateur?.toLowerCase().includes(query)) ||
        (session.etat?.toLowerCase().includes(query))
      ));
      return matchesDomaine || matchesSession;
    });

    setFilteredFormations(filtered);
  };

  const toggleDomain = (domaine: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domaine]: !prev[domaine]
    }));
  };

  const getFormateurName = (id_formateur: number) => {
    const formateur = formateurs.find(f => f.id_formateur === id_formateur);
    return formateur?.nom_complet || "Inconnu";
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

  const handleDeleteSession = async (formationId: number, sessionId: number) => {
    // Vérification des permissions
    if (user.nom_acces !== "super_admin" && user.nom_acces !== "editeur formation") {
      setErrorMessage("Vous n'avez pas les permissions nécessaires pour supprimer une session.");
      return;
    }
  
  
    try {
      // Appel API pour supprimer la session
      const response = await axios.delete(
       ` ${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form/${formationId}/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('user')}`
          }
        }
      );
      if (response.data.success) {
        // Mise à jour locale de l'état sans recharger toute la page
        console.log("idformation=", formationId);
        console.log("idsession", sessionId);
        setFormations(prevFormations =>
          prevFormations.map(formation =>
            formation.id_formation === formationId
              ? {
                  ...formation,
                  sessions: formation.sessions.filter(session => session.id_session !== sessionId)
                }
              : formation
          )
        );
        setFilteredFormations(prevFormations =>
          prevFormations.map(formation =>
            formation.id_formation === formationId
              ? {
                  ...formation,
                  sessions: formation.sessions.filter(session => session.id_session !== sessionId)
                }
              : formation
          )
        );
  
        // Notification de succès
        alert('Session supprimée avec succès !');
      } else {
        throw new Error(response.data.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la session:", error);
      
      // Gestion des erreurs avec des messages utilisateur-friendly
      let errorMessage = "Une erreur est survenue lors de la suppression";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
  
      setErrorMessage(errorMessage);
      alert(errorMessage);
    }
  };

  const handleEditFormation = (formation: Formation) => {
    console.log("Formation sélectionnée pour édition:", formation);
    if (!formation || !formation.id_formation) {
      console.error("Formation invalide");
      return;
    }
    setEditingFormation({...formation}); // Crée une nouvelle référence
  };
  
  const handleUpdateFormation = () => {
    console.log("Mise à jour terminée, fermeture de l'éditeur");
    setEditingFormation(null);
    refreshFormations().catch(e => console.error("Erreur rafraîchissement:", e));
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
  

  if (loading) return <div className="text-center py-8">Chargement en cours...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;



  return (
    <div className="max-w-4xl mx-auto p-4">
      {editingFormation && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <UpdateFormation 
      formation={editingFormation} 
      onUpdate={handleUpdateFormation}
      onCancel={() => setEditingFormation(null)}
    />
  </div>
)}
  
      {!editingFormation && (
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Gestion des Formations</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowAddFormation(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <span className="mr-2">+</span> Nouvelle Formation
            </button>
          </div>
        </div>
      )}
  
      {showAddFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AddFormation 
              onFormationAdded={() => {
                refreshFormations();
                setShowAddFormation(false);
              }} 
              onClose={() => setShowAddFormation(false)} 
            />
          </div>
        </div>
      )}


      {filteredFormations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Aucune formation trouvée</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(new Set(filteredFormations.map(f => f.domaine))).map(domaine => (
            <div key={domaine} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-teal-50 cursor-pointer"
                onClick={() => toggleDomain(domaine)}
              >
                <h2 className="text-xl font-semibold text-teal-700">{domaine}</h2>
                {expandedDomains[domaine] ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedDomains[domaine] && (
                <div className="divide-y divide-gray-200">
                  {filteredFormations
                    .filter(f => f.domaine === domaine)
                    .map(formation => (
                      <div key={formation.id_formation} className="p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium">
                          </h3>
                          
                        </div>

                        {formation.sessions.length > 0 ? (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thème/Code</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formateur</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avis</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {formation.sessions.map(session => (
          <tr key={session.id_session} className="hover:bg-gray-50">
            {/* Colonne Thème/Code */}
            <td className="px-4 py-4">
              <div className="font-medium text-gray-900">{session.theme}</div>
              <div className="text-sm text-gray-500">{session.code}</div>
            </td>
            
            {/* Colonne Dates */}
            <td className="px-4 py-4 whitespace-nowrap">
              <div className="text-sm">
                <span className="font-semibold">Début:</span> {formatDate(session.date_debut)}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Fin:</span> {formatDate(session.date_fin)}
              </div>
              <div className="text-sm text-gray-500">
                Durée: {session.duree}h
              </div>
            </td>
            
            {/* Colonne Formateur */}
            <td className="px-4 py-4">
              <div className="text-sm font-medium text-gray-900">
                {getFormateurName(session.id_formateur)}
              </div>
            </td>
            
            {/* Colonne Type/Mode */}
            <td className="px-4 py-4">
              
              <div className="text-sm">
                <span className="font-semibold">Mode:</span> {session.mode}
              </div>
              
            </td>
            
            {/* Colonne Détails */}
            <td className="px-4 py-4">
            <div className="text-sm">
                <span className="font-semibold">Type:</span> {session.type_session}
              </div>
              {session.lieu && (
                <div className="text-sm">
                  <span className="font-semibold">Lieu:</span> {session.lieu}
                </div>
              )}
              <div className="text-sm">
                <span className="font-semibold">Genre:</span> {session.genre}
              </div>
              
            </td>
            
            {/* Colonne Documents */}
            <td className="px-4 py-4">
              <div className="space-y-2">
                {renderFileLink(session.fiche_prg, "Programme")}
                {renderFileLink(session.cours_session, "Support")}
              </div>
            </td>
            
            {/* Colonne Statut/Participants */}
            <td className="px-4 py-4">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                session.etat === 'A Réalisé' ? 'bg-green-100 text-green-800' :
                session.etat === 'planifiée' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {session.etat}
              </span>
              
            </td>
            <td>
            <div className="mt-1 text-sm">
                Participants: {session.nb_participants || 0}
              </div>
            </td>
            
            <td>
            {session.etat === "Déja Réalisé" && (
                                          <>
                                              <button onClick={() => handleViewAvisParticipants(session.id_session)}  className="text-teal-500">
                                                avis participants 🌟 </button>
                                              {isAvispOpen && loading && <p>Chargement...</p>} 
                                              {isAvispOpen && error && <p>{error}</p>}
                                              {isAvispOpen && !loading && (
                                              <Avis avisList={avisP}  loading={loading}  error={error}  onClose={() => setIsAvispOpen(false)} />
                                              )}
                                         
                                           <button onClick={() => handleViewAvisFormateurs(session.id_session)} className="text-teal-500">
                                             avis Formateur 🌟 </button>
                                           {isAvisfOpen && loading && <p>Chargement...</p>} 
                                           {isAvisfOpen && error && <p>{error}</p>}
                                           {isAvisfOpen && !loading && (
                                           <AvisFormateur avisList={avisF}  loading={loading}  error={error}  onClose={() => setIsAvisfOpen(false)} />
                                           )}
                                       </>
                                        )}
            </td>
            {/* Colonne Actions */}
            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
              {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                <div className="flex space-x-2 justify-end">
                  <button
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log("Clic capturé - ID Formation:", formation.id_formation);
  handleEditFormation(formation);
}}                    className="text-teal-600 hover:text-teal-800 p-1"
                    title="Modifier"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(formation.id_formation, session.id_session);
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Supprimer"
                  >
                    <FaTrash />
                  </button>
                
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  < >
  </>
)}
                              
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormationsList;
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
    if (!confirm(`Voulez-vous vraiment supprimer la session ${sessionId} ?`)) return;

    try {
        const response = await axios.delete(
           ` ${import.meta.env.VITE_APP_API_URL}/apiAdmin/formations/Form/${formationId}/sessions/${sessionId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (response.data.success) {
            // Mise à jour optimiste de l'état
            setFormations(prev => prev.map(f => 
                f.id_formation === formationId
                    ? { ...f, sessions: f.sessions.filter(s => s.id_session !== sessionId) }
                    : f
            ));
            alert("Session supprimée avec succès !");
        }
    } catch (error) {
        console.error("Erreur suppression:", error);
        alert(
            axios.isAxiosError(error)
                ? error.response?.data?.message || "Erreur serveur"
                : "Échec de la suppression"
        );
    }
};

  if (loading) return <div className="text-center py-8">Chargement en cours...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;



  return (
    <div className="container mx-auto px-4 py-8">
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
            <span className="mr-2">+</span> Planifier formation ?
          </button>
        </div>
      </div>

      {showAddFormation && (
        <AddFormation 
          onFormationAdded={() => {
            refreshFormations();
            setShowAddFormation(false);
          }} 
          onClose={() => setShowAddFormation(false)} 
        />
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
                          {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formation") && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditFormation(formation)}
                                className="text-teal-600 hover:text-teal-800 p-1"
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
                        </div>

                        {formation.sessions.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thème</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formateur</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {formation.sessions.map(session => (
                                  <tr key={session.id_session} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="font-medium text-gray-900">{session.theme}</div>
                                      <div className="text-sm text-gray-500">{session.code}</div>
                                      <div className="text-sm text-gray-500">
                                        {session.type_session} • {session.lieu || 'Non spécifié'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm">
                                        Du {formatDate(session.date_debut)}
                                      </div>
                                      <div className="text-sm">
                                        Au {formatDate(session.date_fin)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">
                                        {getFormateurName(session.id_formateur)}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="space-y-1">
                                        {renderFileLink(session.fiche_prg, "Fiche Programme")}
                                        {renderFileLink(session.cours_session, "Cours")}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        session.etat === 'A Réalisé' ? 'bg-green-100 text-green-800' :
                                        session.etat === 'planifiée' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {session.etat}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {session.nb_participants || 0}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            Aucune session disponible pour cette formation
                          </div>
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
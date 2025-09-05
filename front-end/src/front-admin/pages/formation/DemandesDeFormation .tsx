{/*import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DemandesDeFormation = () => {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [archivedDemandes, setArchivedDemandes] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/demanderFormation`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // Formatage des données reçues
        const formattedDemandes = response.data.map((demande: any) => {
          const userInfo = demande.user_info || {}; // Utilisation sécurisée de `user_info`
          return {
            ...demande,
            nom_complet: userInfo.nom_complet || demande.nom_complet || '--',
            mail: userInfo.mail || demande.contactMail || '--',
            telephone: userInfo.telephone || demande.contactTel || '--',
            matricule: userInfo.matricule || demande.matricule || '--',
          };
        });

        // Charger les demandes archivées depuis localStorage
        const archivedFromStorage = JSON.parse(localStorage.getItem('archivedDemandes') || '[]');

        // Filtrer les demandes pour ne pas inclure celles archivées
        const filteredDemandes = formattedDemandes.filter(
          (demande: any) => !archivedFromStorage.some((archived: any) => archived.id === demande.id)
        );

        setDemandes(filteredDemandes);
        setArchivedDemandes(archivedFromStorage);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        setError('Une erreur est survenue lors du chargement des demandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, []);

  const handleArchiver = (id: number) => {
    const demandeToArchive = demandes.find((demande) => demande.id === id);
    if (demandeToArchive) {
      const updatedArchivedDemandes = [...archivedDemandes, demandeToArchive];
      setArchivedDemandes(updatedArchivedDemandes);
      setDemandes((prevDemandes) => prevDemandes.filter((demande) => demande.id !== id));

      // Sauvegarder dans localStorage
      localStorage.setItem('archivedDemandes', JSON.stringify(updatedArchivedDemandes));
    }
  };

  const handleToggleArchived = () => {
    setShowArchived((prev) => !prev);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement en cours...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-xl text-teal-500 font-semibold mb-4 text-center">Liste des demandes de formation</h2>
      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          onClick={handleToggleArchived}
        >
          {showArchived ? 'Masquer les demandes archivées' : 'Voir les demandes archivées'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 border">Domaine</th>
              <th className="px-4 py-2 border">Thème</th>
              <th className="px-4 py-2 border">Formateur</th>
              <th className="px-4 py-2 border">Niveau</th>
              <th className="px-4 py-2 border">Participants</th>
              <th className="px-4 py-2 border">Demandeur</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Téléphone</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(showArchived ? archivedDemandes : demandes).map((demande) => (
              <tr key={demande.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{demande.domaine}</td>
                <td className="px-4 py-2 border">{demande.theme}</td>
                <td className="px-4 py-2 border">{demande.formateur}</td>
                <td className="px-4 py-2 border">{demande.niveau}</td>
                <td className="px-4 py-2 border">{demande.nombreParticipants}</td>
                <td className="px-4 py-2 border">{demande.nom_complet}</td>
                <td className="px-4 py-2 border">{demande.mail}</td>
                <td className="px-4 py-2 border">{demande.telephone}</td>
                <td className="px-4 py-2 border">
                  {showArchived ? (
                    <span className="text-gray-500">Archivée</span>
                  ) : (
                    <button
                      className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600 text-sm"
                      onClick={() => handleArchiver(demande.id)}
                    >
                      Archiver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DemandesDeFormation;*/}






import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CandidatureFormateur from '../formateur/CandidatureFormateur';

// Modèle TypeScript amélioré
class DemandeFormation {
  id: number;
  domaine: string;
  theme: string;
  formateur: string;
  niveau: string;
  nombreParticipants: number;
  details: string;
  mode: string;
  id_participant: string;
  participant?: {
    nom_complet: string;
    mail: string;
    telephone: string;
    entreprise?: {
      nom_entreprise: string;
    };
    direction_servie: string;
  };

  constructor(data: any) {
    this.id = data.id;
    this.domaine = data.domaine;
    this.theme = data.theme;
    this.formateur = data.formateur || 'Non spécifié';
    this.niveau = data.niveau;
    this.nombreParticipants = data.nombre_participants;
    this.details = data.details || '';
    this.mode = data.mode;
    this.id_participant = data.id_participant;
    this.participant = data.participant;
  }

  get quiDemande() {
    return this.participant?.nom_complet || 'Anonyme';
  }

  get contactMail() {
    return this.participant?.mail || '';
  }

  get contactTel() {
    return this.participant?.telephone || '';
  }

  get entreprise() {
    return this.participant?.entreprise?.nom_entreprise || 'Non spécifiée';
  }

  get directionService() {
    return this.participant?.direction_servie || '';
  }
}

const DemandesDeFormation = () => {
  const [demandes, setDemandes] = useState<DemandeFormation[]>([]);
  const [archivedDemandes, setArchivedDemandes] = useState<DemandeFormation[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/demanderFormation`);
        
        // Récupérer les IDs archivés depuis le localStorage
        const archivedIds = JSON.parse(localStorage.getItem('archivedDemandeIds') || '[]');
        
        // Séparer les demandes actives et archivées
        const activeDemandes: DemandeFormation[] = [];
        const archivedDemandes: DemandeFormation[] = [];
        
        response.data.forEach((demande: any) => {
          const demandeObj = new DemandeFormation(demande);
          if (archivedIds.includes(demandeObj.id)) {
            archivedDemandes.push(demandeObj);
          } else {
            activeDemandes.push(demandeObj);
          }
        });

        setDemandes(activeDemandes);
        setArchivedDemandes(archivedDemandes);
      } catch (error) {
        console.error('Erreur:', error);
        setError('Une erreur est survenue lors du chargement des demandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDemandes();
  }, []);

  const handleArchiver = (id: number) => {
    const demandeToArchive = demandes.find((demande) => demande.id === id);
    if (demandeToArchive) {
      // Mettre à jour les états
      setArchivedDemandes((prev) => [...prev, demandeToArchive]);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
      
      // Mettre à jour le localStorage
      const archivedIds = JSON.parse(localStorage.getItem('archivedDemandeIds') || '[]');
      if (!archivedIds.includes(id)) {
        localStorage.setItem('archivedDemandeIds', JSON.stringify([...archivedIds, id]));
      }
    }
  };

  const handleRestore = (id: number) => {
    const demandeToRestore = archivedDemandes.find((d) => d.id === id);
    if (demandeToRestore) {
      // Mettre à jour les états
      setDemandes((prev) => [...prev, demandeToRestore]);
      setArchivedDemandes((prev) => prev.filter((d) => d.id !== id));
      
      // Mettre à jour le localStorage
      const archivedIds = JSON.parse(localStorage.getItem('archivedDemandeIds') || '[]');
      localStorage.setItem('archivedDemandeIds', JSON.stringify(archivedIds.filter((archivedId: number) => archivedId !== id)));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Demandes de Formation" />
      
      <div className="max-w-6xl mx-auto p-6 bg-white border rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl text-teal-500 font-semibold mb-4 text-center">
          Liste des demandes de formation
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end mb-4 space-x-2">
          <button
            className={`px-4 py-2 rounded ${showArchived ? 'bg-gray-500' : 'bg-teal-500'} text-white hover:bg-opacity-90`}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Voir les demandes actives' : 'Voir les archives'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domaine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thème
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(showArchived ? archivedDemandes : demandes).length > 0 ? (
                (showArchived ? archivedDemandes : demandes).map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.domaine}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.theme}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${demande.niveau === 'débutant' ? 'bg-green-100 text-green-800' : 
                          demande.niveau === 'intermédiaire' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {demande.niveau}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.nombreParticipants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.quiDemande}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {demande.entreprise}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{demande.contactMail}</div>
                      <div className="text-gray-500">{demande.contactTel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {showArchived ? (
                        <button
                          onClick={() => handleRestore(demande.id)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          Restaurer
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiver(demande.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Archiver
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                    {showArchived ? 'Aucune demande archivée' : 'Aucune demande active'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <CandidatureFormateur />
      </div>
    </>
  );
};

export default DemandesDeFormation;
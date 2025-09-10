
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import CandidatureFormateur from '../formateur/CandidatureFormateur';

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
        
        const archivedIds = JSON.parse(localStorage.getItem('archivedDemandeIds') || '[]');
        
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
      setArchivedDemandes((prev) => [...prev, demandeToArchive]);
      setDemandes((prev) => prev.filter((d) => d.id !== id));
      const archivedIds = JSON.parse(localStorage.getItem('archivedDemandeIds') || '[]');
      if (!archivedIds.includes(id)) {
        localStorage.setItem('archivedDemandeIds', JSON.stringify([...archivedIds, id]));
      }
    }
  };

  const handleRestore = (id: number) => {
    const demandeToRestore = archivedDemandes.find((d) => d.id === id);
    if (demandeToRestore) {
      setDemandes((prev) => [...prev, demandeToRestore]);
      setArchivedDemandes((prev) => prev.filter((d) => d.id !== id));
      
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
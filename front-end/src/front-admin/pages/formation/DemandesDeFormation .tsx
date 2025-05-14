import React, { useEffect, useState } from 'react';
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

export default DemandesDeFormation;
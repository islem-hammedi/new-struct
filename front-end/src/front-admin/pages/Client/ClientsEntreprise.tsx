import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for the client data
interface Client {
  nom_entreprise: string;
  telephone_entreprise: string;
  email_entreprise: string;
  adresse_entreprise: string;
  matricule: string;
  themes: string;
}
interface Participant {
  id_participant: number;
  nom_complet: string;
  telephone: string;
  mail: string;
  adresse: string;
  themes: string;
  badge: string;
}
const ClientsEntreprise = () => {
  const [clients, setClients] = useState<Client[]>([]); // Set the type of the array to Client[]
  const [participants, setParticipants] = useState<Participant[]>([]); // Annotate the participants state with Participant[]
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<string | null>(null); // Set the type to string or null
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    // Récupérer les données des clients entreprises depuis l'API
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/clients-entreprises`)
      .then(response => {
        setClients(response.data);

        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des entreprises:", error);
        setLoading(false);
      });
  }, []);
  const handleBadgeChange = async (id_participant: number, newBadge: string) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/update-badge/${id_participant}`,
        { badge: newBadge }
      );
      
      if (response.data.success) {
        
        setParticipants(participants.map(p => 
          p.id_participant === id_participant ? { ...p, badge: newBadge } : p
        ));
        alert("Badge mis à jour avec succès");
      } else {
        console.error("Échec de la mise à jour:", response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur lors de la mise à jour du badge:", error.response?.data || error.message);
      } else {
        console.error("Erreur lors de la mise à jour du badge:", error);
      }
    }
  };
  const handleEntrepriseClick = (entrepriseName: string) => {
    setLoadingParticipants(true);
    setSelectedEntreprise(entrepriseName);
    const encodedEntrepriseName = encodeURIComponent(entrepriseName);

    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/clients-entreprises/${encodedEntrepriseName}`)
      .then(response => {
        setParticipants(response.data);
        console.log("Données participants:", response.data); // Ajoutez ce log

        setLoadingParticipants(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des participants:", error);
        setLoadingParticipants(false);
      });
  };

  if (loading) return <div>Chargement des entreprises...</div>;

  // Fonction de filtrage des clients en fonction du terme de recherche
  const filteredClients = clients.filter(client =>
    client.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.telephone_entreprise && client.telephone_entreprise.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.email_entreprise && client.email_entreprise.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.adresse_entreprise && client.adresse_entreprise.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.matricule && client.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.themes && client.themes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fonction de filtrage des participants en fonction du terme de recherche
  const filteredParticipants = participants.filter(participant =>
    participant.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (participant.telephone && participant.telephone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.mail && participant.mail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.adresse && participant.adresse.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (participant.themes && participant.themes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="dark:border-strokedark container mx-auto p-6 mt-10">
                  <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Nos Entreprises</h1>

      <input
        type="text"
        placeholder="Rechercher une entreprise ou un participant..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-6 text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <table className="dark:border-strokedark min-w-full bg-white border border-gray-300 shadow-md">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-left">Nom Entreprise</th>
            <th className="py-2 px-4 border-b text-left">Téléphone Entreprise</th>
            <th className="py-2 px-4 border-b text-left">Email Entreprise</th>
            <th className="py-2 px-4 border-b text-left">Adresse Entreprise</th>
            <th className="py-2 px-4 border-b text-left">matricule Fiscale</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client, index) => (
            <tr key={index} onClick={() => handleEntrepriseClick(client.nom_entreprise)}>
              <td className="py-2 px-4 border-b">{client.nom_entreprise}</td>
              <td className="py-2 px-4 border-b">{client.telephone_entreprise}</td>
              <td className="py-2 px-4 border-b">{client.email_entreprise}</td>
              <td className="py-2 px-4 border-b">{client.adresse_entreprise}</td>
              <td className="py-2 px-4 border-b">{client.matricule}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedEntreprise && (
        <div className="mt-10">
          {loadingParticipants ? (
            <div>Chargement des participants...</div>
          ) : (
            <div>
              <h2 className="dark:border-strokedark text-xl font-semibold mb-4">Participants de {selectedEntreprise}</h2>
              <table className="dark:border-strokedark min-w-full bg-white border border-gray-300 shadow-md">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Nom</th>
                    <th className="py-2 px-4 border-b text-left">Téléphone</th>
                    <th className="py-2 px-4 border-b text-left">Email</th>
                    <th className="py-2 px-4 border-b text-left">Adresse</th>
                    <th className="py-2 px-4 border-b text-left">Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((participant, id_participant) => (
                    <tr key={id_participant}>
                      <td className="py-2 px-4 border-b">{participant.nom_complet}</td>
                      <td className="py-2 px-4 border-b">{participant.telephone}</td>
                      <td className="py-2 px-4 border-b">{participant.mail}</td>
                      <td className="py-2 px-4 border-b">{participant.adresse}</td>
                      <td className="py-2 px-4 border-b">
                        <select 
                          value={participant.badge || 'normal'} // Utilise le badge du participant ou "normal" si le badge est null/undefined
                          onChange={(e) => handleBadgeChange(participant.id_participant, e.target.value)}
                          className="border rounded p-2 bg-gray-200"
                        >
                          <option value="normal">Normal</option>
                          <option value="special">Spécial</option>
                        </select>
                      </td>         
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsEntreprise;

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the type for the client data

interface Participant {
  id_participant: number;
  nom_complet: string;
  telephone: string;
  mail: string;
  adresse: string;
  themes: string;
  badge: string;
}
const ClientsPersonne = () => {
  const [clients, setClients] = useState<Participant[]>([]); // Annotate the clients state with Client[]
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]); // Annotate the participants state with Participant[]

  useEffect(() => {
    // Fetch the data for clients (personnes) from the API
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/clients-personnes`)
      .then(response => {
        setClients(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des clients:", error);
        setLoading(false);
      });
  }, []);

  // Filter clients based on the search term
  const filteredClients = clients.filter(client =>
    client.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.themes.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleBadgeChange = async (id_participant: number, newBadge: string) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/update-badge/${id_participant}`,
        { badge: newBadge }
      );
      
      if (response.data.success) {
        
        // Mise à jour locale de l'état
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
  if (loading) return <div>Chargement des clients...</div>;

  return (
    <div className="container mx-auto p-6 mt-10 dark:border-strokedark">
      <h1 className="text-3xl font-semibold mb-5">Nos Clients</h1>
      <input
        type="text"
        placeholder="Rechercher un client..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full dark:border-strokedark dark:text-white p-3 mb-6 text-base rounded-lg border dark:border-strokedark focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <table className="min-w-full bg-white border dark:border-strokedark border-gray-300 shadow-md">
        <thead>
          <tr>
            <th className=" py-2 px-4 border-b text-left">Nom</th>
            <th className="py-2 px-4 border-b text-left">Téléphone</th>
            <th className="py-2 px-4 border-b text-left">Email</th>
            <th className="py-2 px-4 border-b text-left">Adresse</th>
            <th className="py-2 px-4 border-b text-left">Sessions</th>
            <th className="py-2 px-4 border-b text-left">Badge</th>

          </tr>
        </thead>
        <tbody>
          {filteredClients.map((participant, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{participant.nom_complet}</td>
              <td className="py-2 px-4 border-b">{participant.telephone}</td>
              <td className="py-2 px-4 border-b">{participant.mail}</td>
              <td className="py-2 px-4 border-b">{participant.adresse}</td>
              <td className="py-2 px-4 border-b">{participant.theme}</td>
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
  );
};

export default ClientsPersonne;

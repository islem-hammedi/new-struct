import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Entreprise {
  id_entreprise?: number;
  nom_entreprise: string;
  tel_entreprise: string;
  email_entreprise: string;
  adr_entreprise: string;
  matricule: string;
}

interface Participant {
  id_participant: number;
  nom_complet: string;
  mail: string;
  telephone: string;
  adresse: string;
  CIN?: string | null;
  id_entreprise?: number | null;
  entreprise?: Entreprise;
  badge?: string; 
}

const ProfilParticipant: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          navigate("/");
          return;
        }
  
        const userData = JSON.parse(storedUser);
        
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
  
        console.log("Données complètes reçues:", response.data);
        
        // Normalisation des données
        const participantData = {
          ...response.data,
          badge: response.data.badge || response.data.Badge || userData.badge || null
        };
  
        setParticipant({
          id_participant: participantData.id_participant,
          nom_complet: participantData.nom_complet,
          mail: participantData.mail,
          telephone: participantData.telephone,
          adresse: participantData.adresse,
          CIN: participantData.CIN,
          id_entreprise: participantData.id_entreprise,
          entreprise: participantData.entreprise || null,
          badge: participantData.badge // Utilisation du badge normalisé
        });
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        setError("Impossible de charger les données du profil");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [navigate]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipant(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleEntrepriseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParticipant(prev => {
      if (!prev) return null;
      return {
        ...prev,
        entreprise: {
          ...(prev.entreprise || {
            nom_entreprise: '',
            tel_entreprise: '',
            email_entreprise: '',
            adr_entreprise: '',
            matricule: ''
          }),
          [name]: value
        }
      };
    });
  };

// Modifiez la fonction handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
          navigate("/login");
          return;
      }

      const userData = JSON.parse(storedUser);
      const participantId = Number(userData.id);
      
      if (isNaN(participantId)) {
          throw new Error("ID participant invalide");
      }

      // Validation des données requises
      if (!participant?.nom_complet || !participant?.mail) {
          throw new Error("Le nom complet et l'email sont obligatoires");
      }

      // Préparation du payload
      const payload = {
          nom_complet: participant.nom_complet.trim(),
          mail: participant.mail.trim(),
          telephone: participant.telephone?.trim() || null,
          adresse: participant.adresse?.trim() || null,
          CIN: participant.CIN?.trim() || null,
          entreprise: participant.entreprise ? {
              nom_entreprise: participant.entreprise.nom_entreprise?.trim(),
              tel_entreprise: participant.entreprise.tel_entreprise?.trim(),
              email_entreprise: participant.entreprise.email_entreprise?.trim(),
              adr_entreprise: participant.entreprise.adr_entreprise?.trim(),
              matricule: participant.entreprise.matricule?.trim()
          } : null
      };

      // Envoi de la requête
      const response = await axios.put(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${participantId}`,
          payload,
          {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userData.token}`
              }
          }
      );

      // Mise à jour de l'état avec la réponse complète
      if (response.data.data) {
          setParticipant({
              id_participant: response.data.data.id_participant,
              nom_complet: response.data.data.nom_complet,
              mail: response.data.data.mail,
              telephone: response.data.data.telephone,
              adresse: response.data.data.adresse,
              CIN: response.data.data.CIN,
              id_entreprise: response.data.data.id_entreprise,
              entreprise: response.data.data.entreprise || null
          });
      }

      setSuccess(response.data.message || "Profil mis à jour avec succès");
      setIsEditing(false);
  } catch (err) {
      // ... gestion des erreurs existante ...
  }
};if (loading) {
    return <p className="text-center text-gray-500 mt-10">Chargement du profil...</p>;
  }

  if (!participant) return <p className="text-center text-gray-500 mt-10">Chargement du profil...</p>;

  return (
    <div className="max-w-xl pt-30 mx-auto mt-0 p-3 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-3xl text-center font-semibold text-teal-600 dark:text-white mb-4">
        Mon Profil
      </h2>

      {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">{error}</div>}
      {success && <div className="p-3 mb-4 text-green-700 bg-green-100 rounded-md">{success}</div>}

      {participant.badge && participant.badge.toLowerCase() === "special" && (
  <div className="mt-4 p-4  text-gray-600 rounded">
    <p className="font-semibold">Profil spécial</p>
    <p className="text-teal-600">Ce participant bénéficie de privilèges particuliers.</p>
    <ul className="mt-2 list-disc pl-5">
      <li>Accès prioritaire aux formations</li>
      <li>Tarifs préférentiels</li>
      <li>Support dédié</li>
    </ul>
  </div>
)}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
         
          <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>
            <div>
            
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet*</label>
              <input
                type="text"
                name="nom_complet"
                value={participant.nom_complet || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email*</label>
              <input
                type="email"
                name="mail"
                value={participant.mail || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
              <input
                type="text"
                name="telephone"
                value={participant.telephone || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
              <input
                type="text"
                name="adresse"
                value={participant.adresse || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CIN</label>
              <input
                type="text"
                name="CIN"
                value={participant.CIN || ""}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="mt-4 space-y-4">
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Informations Entreprise</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Entreprise</label>
                <input
                  type="text"
                  name="nom_entreprise"
                  value={participant.entreprise?.nom_entreprise || ""}
                  onChange={handleEntrepriseChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matricule</label>
                <input
                  type="text"
                  name="matricule"
                  value={participant.entreprise?.matricule || ""}
                  onChange={handleEntrepriseChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tél Entreprise</label>
                <input
                  type="text"
                  name="tel_entreprise"
                  value={participant.entreprise?.tel_entreprise || ""}
                  onChange={handleEntrepriseChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Entreprise</label>
                <input
                  type="email"
                  name="email_entreprise"
                  value={participant.entreprise?.email_entreprise || ""}
                  onChange={handleEntrepriseChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse Entreprise</label>
                <input
                  type="text"
                  name="adr_entreprise"
                  value={participant.entreprise?.adr_entreprise || ""}
                  onChange={handleEntrepriseChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-teal-600 text-white rounded-md mt-4 hover:bg-teal-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Nom:</strong> {participant.nom_complet}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Email:</strong> {participant.mail}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Téléphone:</strong> {participant.telephone || "Non renseigné"}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Adresse:</strong> {participant.adresse || "Non renseignée"}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">CIN:</strong> {participant.CIN || "Non renseigné"}
            </p>

            {participant?.entreprise && (
    <div className="border-t pt-4 mt-4">
        <h3 className="font-medium text-gray-900 dark:text-white">Entreprise</h3>
        {participant.entreprise.nom_entreprise && (
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Nom:</strong> {participant.entreprise.nom_entreprise}
            </p>
        )}
        {participant.entreprise.matricule && (
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Matricule:</strong> {participant.entreprise.matricule}
            </p>
        )}
        {participant.entreprise.tel_entreprise && (
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Téléphone:</strong> {participant.entreprise.tel_entreprise}
            </p>
        )}
        {participant.entreprise.email_entreprise && (
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> {participant.entreprise.email_entreprise}
            </p>
        )}
        {participant.entreprise.adr_entreprise && (
            <p className="text-gray-700 dark:text-gray-300">
                <strong>Adresse:</strong> {participant.entreprise.adr_entreprise}
            </p>
        )}
    </div>
)}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-3 bg-teal-600 text-white rounded-md mt-4 hover:bg-teal-700"
          >
            Modifier mon profil
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilParticipant;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Session {
  id_session: number;
  theme: string;
}

interface Participant {
  id_participant: number;
  nom_complet: string;
  mail: string;
  telephone: string;
  adresse: string;
  matricule: string;
  nom_entreprise: string;
  tel_entreprise: string;
  email_entreprise: string;
  adr_entreprise: string;
  nature_participant: string;
  sessions: Session[];
}

const ProfilParticipant: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Flag pour afficher le formulaire d'édition
  const navigate = useNavigate();

  const fetchParticipantDetails = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      if (!userData.id_participant) {
        console.error("ID participant non trouvé !");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${userData.id_participant}`,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        }
      );

      setParticipant(response.data);
      //setFormData(response.data); // Pré-remplir les données du formulaire
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du participant:", error);
    }
  };

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); 
        return;
      }
      fetchParticipantDetails();
    };

    checkAuthentication();
  }, [navigate]);
  useEffect(() => {
    if (participant) {
      // Update localStorage when participant data changes
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUserData = { ...userData, ...participant };
      localStorage.setItem("user", JSON.stringify(updatedUserData));
    }
  }, [participant]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Assurez-vous que l'objet participant est toujours défini avant de modifier son état.
    setParticipant((prevData) => {
      if (prevData) {
        return { ...prevData, [name]: value || '' }; // Utilisez '' ou une autre valeur par défaut pour éviter undefined
      }
      return prevData; // Si prevData est null, ne faites rien.
    });
  };
  
  
  const handleNatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    setParticipant((prevData) => {
      if (prevData) {
        return { ...prevData, nature_participant: value || 'personne physique' }; // Définit une valeur par défaut si nécessaire
      }
      return prevData;
    });
  };
  

  /*const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!participant || !participant.id_participant) {
      console.error("Participant data is incomplete.");
      return;
    }
  
    try {
      
  
      // Ajoutez une logique pour gérer les champs undefined ici
      const updatedParticipant = {
        ...participant,
        id_participant: participant.id_participant, 
        nom_complet: participant.nom_complet || '',
        mail: participant.mail || '',
        telephone: participant.telephone || '',
        adresse: participant.adresse || '',
        nature_participant: participant.nature_participant || 'personne',
        matricule: participant.matricule || '',
        nom_entreprise: participant.nom_entreprise || '', 
        tel_entreprise: participant.tel_entreprise || '',
        email_entreprise: participant.email_entreprise || '',
        adr_entreprise: participant.adr_entreprise || '',
      };
      console.log("ID participant :", participant?.id_participant);

      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${participant.id_participant}`,
        updatedParticipant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
       setIsEditing(false); // Fermer le mode édition
      fetchParticipantDetails(); // Recharger les détails du participant
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUserData = { ...userData, ...updatedParticipant };
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      console.log("Participant mis à jour :", updatedUserData);

    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    }
  };*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!participant || !participant.id_participant) {
      console.error("Participant data is incomplete.");
      return;
    }
  
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${participant.id_participant}`,
        participant,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      setIsEditing(false); // Assurez-vous de désactiver le mode édition
      fetchParticipantDetails(); // Recharger les détails mis à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    }
  };
  
  
  

  if (!participant) return <p className="text-center text-gray-500 mt-10">Chargement du profil...</p>;

  return (
    <div className="max-w-xl pt-30 mx-auto mt-0 p-3 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <h2 className="text-3xl text-center font-semibold text-teal-600 dark:text-white mb-4">
        Mon Profil
      </h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet</label>
            <input
              type="text"
              name="nom_complet"
              value={participant?.nom_complet || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="mail"
              value={participant?.mail || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={participant?.telephone || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
            <input
              type="text"
              name="adresse"
              value={participant?.adresse || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nature du Participant</label>
            <select
              name="nature_participant"
              value={participant?.nature_participant || ""}
              onChange={handleNatureChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="personne physique">Personne physique</option>
              <option value="entreprise">Entreprise</option>
            </select>
          </div>

          {participant?.nature_participant === "entreprise" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entreprise</label>
                <input
                  type="text"
                  name="nom_entreprise"
                  value={participant?.nom_entreprise || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Matricule</label>
                <input
                  type="text"
                  name="matricule"
                  value={participant?.matricule || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tél Entreprise</label>
                <input
                  type="text"
                  name="tel_entreprise"
                  value={participant?.tel_entreprise || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Entreprise</label>
                <input
                  type="email"
                  name="email_entreprise"
                  value={participant?.email_entreprise || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse Entreprise</label>
                <input
                  type="text"
                  name="adr_entreprise"
                  value={participant?.adr_entreprise || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full p-3 bg-teal-600 text-white rounded-md mt-4"
          >
            Enregistrer les modifications
          </button></div>
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
            <strong className="text-gray-900 dark:text-white">Téléphone:</strong> {participant.telephone}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">Adresse:</strong> {participant.adresse}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong className="text-gray-900 dark:text-white">Nature:</strong> {participant.nature_participant}
          </p></div>
          <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1'>

          {participant.nature_participant === "entreprise" && (
            <div className="border-t pt-4 mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Entreprise:</strong> {participant.nom_entreprise}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Matricule:</strong> {participant.matricule}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Tél Entreprise:</strong> {participant.tel_entreprise}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Email Entreprise:</strong> {participant.email_entreprise}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">Adresse Entreprise:</strong> {participant.email_entreprise}
              </p>
            </div>
          )}</div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-3 bg-teal-600 text-white rounded-md mt-4"
          >
            Modifier mon profil
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilParticipant;
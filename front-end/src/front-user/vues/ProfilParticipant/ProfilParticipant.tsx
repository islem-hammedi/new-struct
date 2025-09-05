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
  photo_profil?: string;
}

type ProfilePicture = {
  id: string;
  url: string;
  alt: string;
};


const defaultProfilePictures: ProfilePicture[] = [
  { id: '1', url: '/profileFc.png', alt: 'Avatar 1' },
  { id: '2', url: '/pro.png', alt: 'Avatar 2' },
    { id: '3', url: '/proH.png', alt: 'Avatar 1' },
  { id: '4', url: '/profileFh.png', alt: 'Avatar 1' },
  { id: '5', url: '/me.png', alt: 'Avatar 1' },

];

const ProfilePictureSelector = ({
  onSelect,
  initialSelectedId,
}: {
  onSelect: (picture: ProfilePicture) => void;
  initialSelectedId?: string;
}) => {
  const [selectedPicture, setSelectedPicture] = useState<string | null>(
    initialSelectedId || null
  );

  const handleSelect = (picture: ProfilePicture) => {
    setSelectedPicture(picture.id);
    onSelect(picture);
  };

  const selectedPic = defaultProfilePictures.find(
    (pic) => pic.id === selectedPicture
  ) || defaultProfilePictures[0];

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3 text-center">Choisir une photo de profil</h3>
      <div className="grid grid-cols-4 gap-2">
        {defaultProfilePictures.map((picture) => (
          <div
            key={picture.id}
            className={`w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 ${
              selectedPicture === picture.id
                ? 'border-teal-500'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => handleSelect(picture)}
          >
            <img
              src={picture.url}
              alt={picture.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/prof.png';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilParticipant: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
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
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${userData.id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          }
        );
        console.log("Saved photo from localStorage:", userData.photo_profil);
        console.log("Current user in localStorage:", JSON.parse(localStorage.getItem("user") || "{}"));
        const savedPhoto = userData.photo_profil || '/profileDefault.png';
        
        const participantData = {
          ...response.data,
          badge: response.data.badge || response.data.Badge || userData.badge || null,
          photo_profil: savedPhoto !== '/profileDefault.png' ? savedPhoto : (response.data.photo_profil || savedPhoto)
          //photo_profil: response.data.photo_profil || savedPhoto
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
          badge: participantData.badge,
          photo_profil: participantData.photo_profil
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

  const handlePhotoSelect = (picture: ProfilePicture) => {
    const newPhotoUrl = picture.url;
    setParticipant(prev => prev ? { ...prev, photo_profil: newPhotoUrl } : null);
    setSuccess("Photo de profil mise à jour");
    setIsEditingPhoto(false);
    
    // Sauvegarder dans localStorage pour persistance
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      const updatedUser = {
        ...userData,
        photo_profil: newPhotoUrl
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setParticipant(prev => prev ? { ...prev, photo_profil: newPhotoUrl } : null);
    }
  };

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
      if (!participant?.nom_complet || !participant?.mail) {
        throw new Error("Le nom complet et l'email sont obligatoires");
      }
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
      
      if (response.data.data) {
        setParticipant({
          ...participant,
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
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError("Erreur lors de la mise à jour du profil");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Chargement du profil...</p>;
  }

  if (!participant) return <p className="text-center text-gray-500 mt-10">Chargement du profil...</p>;

  return (
    <div className="max-w pt-0 mx-auto mt-0 p-3 bg-white shadow-lg rounded-lg border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <img
            src={participant?.photo_profil || '/prof.png'}
            alt="Photo de profil"
            className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/prof.png';
            }}
          />
          {!isEditingPhoto && (
            <button
              onClick={() => setIsEditingPhoto(true)}
              className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-all"
              title="Modifier la photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        {isEditingPhoto && (
          <div className="mt-4 text-center">
            <ProfilePictureSelector 
              onSelect={handlePhotoSelect} 
              initialSelectedId={defaultProfilePictures.find(pic => pic.url === participant?.photo_profil)?.id}
            />
            <button
              onClick={() => setIsEditingPhoto(false)}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
      <h2 className="text-2xl font-bold mb-4 text-center">{participant.nom_complet}</h2>

       
      {participant.badge && participant.badge.toLowerCase() === "special" && (
        <div className="mt-4 p-4 text-gray-600 rounded">
          <p className="font-semibold">Profil spécial</p>
          <p className="text-teal-600">Vous etes notre client spécial ! vous pouver voir le cv des formateurs des formations publiées dans le calendrier </p>
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

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                className="flex-1 p-3 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 p-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
         <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]'>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Email:</strong> {participant.mail}
                  </p>
                </div>
                
                <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]'>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Téléphone:</strong> {participant.telephone || "Non renseigné"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]'>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">Adresse:</strong> {participant.adresse || "Non renseignée"}
                  </p>
                </div>
                
                <div className='backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]'>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-white">CIN:</strong> {participant.CIN || "Non renseigné"}
                  </p>
                </div>
              </div>
            </div>

            {participant?.entreprise && (
              <div className="border-t pt-4 mt-4">
               {participant.entreprise && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Entreprise</h3>
                
                <div className="flex flex-wrap gap-4 mb-3">
                  {participant.entreprise.nom_entreprise && (
                    <div className="backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Nom:</strong> {participant.entreprise.nom_entreprise}
                      </p>
                    </div>
                  )}
                  
                  {participant.entreprise.matricule && (
                    <div className="backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Matricule:</strong> {participant.entreprise.matricule}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-3">
                  {participant.entreprise.tel_entreprise && (
                    <div className="backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Téléphone:</strong> {participant.entreprise.tel_entreprise}
                      </p>
                    </div>
                  )}
                  
                  {participant.entreprise.email_entreprise && (
                    <div className="backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]">
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>Email:</strong> {participant.entreprise.email_entreprise}
                      </p>
                    </div>
                  )}
                </div>

                {participant.entreprise.adr_entreprise && (
                  <div className="w-full backdrop-blur-sm bg-black/5 p-6 rounded-lg leading-relaxed flex-1 min-w-[300px]">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Adresse:</strong> {participant.entreprise.adr_entreprise}
                    </p>
                  </div>
                )}
              </div>
            )}
              </div>
            )}
         
          <button
            onClick={() => setIsEditing(true)}
            className="w-full p-3 bg-teal-500 text-white rounded-md mt-4 hover:bg-teal-700"
          >
            Modifier mon profil
          </button>
        </div>
      )}
    
    </div>
  );
};

export default ProfilParticipant;


















{/*}


import React, { useState, useEffect } from "react";
import axios from "axios";

const DemanderFormation = () => {
  const [formData, setFormData] = useState({
    domaine: '',
    theme: '',
    formateur: '',
    niveau: 'débutant',
    nombreParticipants: '',
    description: '',
    genreFormation: 'intra',
  });

  const [userInfo, setUserInfo] = useState({
    nom_complet: '',
    mail: '',
    telephone: ''
  });

  const [error, setError] = useState('');

  // Récupérer les infos utilisateur au chargement
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      nom_complet: userData.nom_complet || '',
      mail: userData.mail || '',
      telephone: userData.telephone || ''
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'nombreParticipants' && value !== '' && parseInt(value) < 0) {
      setError('Le nombre de participants ne peut pas être négatif.');
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'nombreParticipants' && parseInt(value) >= 0) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    // Validation des champs obligatoires
    const requiredFields = [
      'domaine',
      'theme',
      'niveau',
      'nombreParticipants',
      'genreFormation',
    ];
  
    for (let field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Le champ ${field} est obligatoire.`);
        return;
      }
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...formData,
        id_participant: userData.id_participant,
        user_info: {
          nom_complet: userInfo.nom_complet,
          mail: userInfo.mail,
          telephone: userInfo.telephone,
          nature_participant: userData.nature_participant,
          matricule: userData.matricule,
          adresse: userData.adresse
        }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/demanderFormation`, 
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        }
      );

      console.log(response.data);
      alert('Merci pour votre demande !');
      setError('');
      
     

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg shadow-md">
      <div className="py-3"> 
        <h2 className="text-2xl text-teal-600 font-bold mb-6 text-center">Demande de Formation Personnalisée</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Vos informations de contact :</h3>
          <p>Nom: {userInfo.nom_complet || 'Non disponible'}</p>
          <p>Email: {userInfo.mail || 'Non disponible'}</p>
          <p>Téléphone: {userInfo.telephone || 'Non disponible'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Domaine *</label>
            <input
              type="text"
              name="domaine"
              value={formData.domaine}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="theme">
            Thème de la formation *
          </label>
          <input
            type="text"
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            required
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="formateur">
           Recommandez un Formateur 
          </label>
          <input
            type="text"
            id="formateur"
            name="formateur"
            value={formData.formateur}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="niveau">
            Niveau *
          </label>
          <select
            id="niveau"
            name="niveau"
            value={formData.niveau}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="débutant">Débutant</option>
            <option value="avancé">Avancé</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="nombreParticipants">
            Nombre de participants *
          </label>
          <input
            type="number"
            id="nombreParticipants"
            name="nombreParticipants"
            value={formData.nombreParticipants}
            onChange={handleChange}
            min="0" // Empêche de saisir des nombres négatifs via l'input HTML
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="genreFormation">
            Genre formation *
          </label>
          <select
            id="genreFormation"
            name="genreFormation"
            value={formData.genreFormation}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            >
            <option value="inter(seminaire)">seminaire</option>
            <option value="intra">Intra</option>
          </select>
      
   
            <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">
           Plus de détails ? 
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
          </div>
     

          
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
            >
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemanderFormation;*/}



















import React, { useState, useEffect } from "react";
import axios from "axios";

const DemanderFormation = () => {
  const [formData, setFormData] = useState({
    domaine: '',
    theme: '',
    formateur: '',
    niveau: 'débutant',
    nombreParticipants: '',
    description: '',
    genreFormation: 'intra-entreprise',
  });

  const [userInfo, setUserInfo] = useState({
    nom_complet: '',
    mail: '',
    telephone: '',
    matricule: '',
    nature_participant: ''
  });

  const [error, setError] = useState('');

  // Récupération des infos utilisateur au chargement
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      nom_complet: userData.nom_complet || '',
      mail: userData.mail || '',
      telephone: userData.telephone || '',
      matricule: userData.matricule || '',
      nature_participant: userData.nature_participant || ''
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'nombreParticipants' && parseInt(value) >= 0) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      
    const requiredFields = [
      'domaine',
      'theme',
    ];
  
    for (let field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Le champ ${field} est obligatoire.`);
        return;
      }
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      const dataToSend = {
        ...formData,
        id_participant: userData.id_participant,
        user_info: {
          nom_complet: userData.nom_complet,
        mail: userData.mail,
        telephone: userData.telephone,
        //  id_participant: userData.id_participant
        }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiUser/demanderFormation`, 
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        }
      );

      alert('Merci pour votre demande !');
      setFormData({
        domaine: '',
        theme: '',
        formateur: '',
        niveau: 'débutant',
        nombreParticipants: '',
        description: '',
        genreFormation: 'intra-entreprise',
      });

    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white border rounded-lg shadow-md">
      <div className="py-3"> 
        <h2 className="text-2xl text-teal-600 font-bold mb-6 text-center">Demande de Formation</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Informations du demandeur :</h3>
          <p>Nom: {userInfo.nom_complet}</p>
          <p>Email: {userInfo.mail}</p>
          <p>Téléphone: {userInfo.telephone}</p>
          {userInfo.matricule && <p>Matricule: {userInfo.matricule}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Domaine *</label>
            <input
              type="text"
              name="domaine"
              value={formData.domaine}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Thème *</label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Formateur recommandé</label>
            <input
              type="text"
              name="formateur"
              value={formData.formateur}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Niveau *</label>
            <select
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="débutant">Débutant</option>
              <option value="avancé">Avancé</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nombre de participants *</label>
            <input
              type="number"
              name="nombreParticipants"
              value={formData.nombreParticipants}
              onChange={handleChange}
              min="0"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type de formation *</label>
            <select
              name="genreFormation"
              value={formData.genreFormation}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            >
              <option value="inter">Inter-entreprise</option>
              <option value="intra">Intra-entreprise</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
          >
            Envoyer la demande
          </button>
        </form>
      </div>
    </div>
  );
};

export default DemanderFormation;
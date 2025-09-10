
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Description } from "@headlessui/react";

const DemanderFormation = () => {
  const [formData, setFormData] = useState({
    domaine: '',
    theme: '',
    formateur: '',
    niveau: 'débutant',
    nombreParticipants: '',
    description: '',
    genreFormation: 'intra',
    mode: 'présentiel' 
  });

  const [userInfo, setUserInfo] = useState({
    nom_complet: '',
    mail: '',
    telephone: '',
    token: '',
    id: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      nom_complet: userInfo.nom_complet || '',
      mail: userInfo.mail || '',
      telephone: userInfo.telephone || '',
      token: userInfo.token || '',
      id: userInfo.id 
      
    });
    console.log("userInfo:", userInfo);

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
    
  const requiredFields = [
    'domaine',
    'theme',
    'niveau',
    'nombreParticipants',
    'mode'  
  ];

  for (let field of requiredFields) {
    if (!formData[field as keyof typeof formData]) {
      setError(`Le champ ${field} est obligatoire.`);
      return;
    }
  }

  try {
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userInfo.token) {
        setError('Token manquant. Veuillez vous reconnecter.');
        return;
      }
    const dataToSend = {
      ...formData,
      id: userInfo.id, 
      nom_complet: userInfo.nom_complet || null,
      mail: userInfo.mail || null,
      telephone: userInfo.telephone || null,
      formateur: formData.formateur || null,
      details: formData.description || null
    };

    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/apiUser/demanderFormation`,dataToSend,
      {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      }
    );

    console.log("Data sent successfully:", response.data);
    alert('Merci pour votre demande !');
    setError('');
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } else {
      console.error('Unexpected error:', error);
      setError('Une erreur inattendue est survenue');
    }
  }
};

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 border rounded-lg shadow-md">
      <div className="py-3"> 
        <h2 className="text-2xl text-teal-500 font-bold mb-6 text-center">Demande de Formation Personalisée</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

       <div className="mb-6 p-4 bg-white rounded-lg">
  <div className="flex items-center gap-4">
    <h3 className="font-medium whitespace-nowrap">Vos informations de contact :</h3>
    <div className="flex items-center gap-6">
      <span className="text-teal-700 font-medium">
        Email: {userInfo.mail || 'Non disponible'}
      </span>
      <span className="text-teal-700 font-medium">
        Téléphone: {userInfo.telephone || 'Non disponible'}
      </span>
    </div>
  </div>
</div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700">Domaine *</label>
    <input
      type="text"
      name="domaine"
      value={formData.domaine}
      onChange={handleChange}
      required
      className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    />
  </div>
  
  <div className="flex-1">
    <label className="block text-sm font-medium text-gray-700" htmlFor="theme">
      Thème *
    </label>
    <input
      type="text"
      id="theme"
      name="theme"
      value={formData.theme}
      onChange={handleChange}
      required
      className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    />
  </div>
  
</div>
<div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="formateur">
           Recommandez un Formateur ? 
          </label>
          <input
            type="text"
            id="formateur"
            name="formateur"
            value={formData.formateur}
            onChange={handleChange}
            className="mt-1 p-4 border border-gray-300 rounded-md w-full"
          />
        </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-700" htmlFor="nombreParticipants">
      Nombre de participants *
    </label>
    <input
      type="number"
      id="nombreParticipants"
      name="nombreParticipants"
      value={formData.nombreParticipants}
      onChange={handleChange}
      min="0"
      className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700" htmlFor="niveau">
      Niveau *
    </label>
    <select
      id="niveau"
      name="niveau"
      value={formData.niveau}
      onChange={handleChange}
      className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    >
      <option value="normale">Normale</option>
      <option value="professionel">Professionel</option>
    </select>
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-700" htmlFor="mode">
      Mode de formation *
    </label>
    <select
      id="mode"
      name="mode"
      value={formData.mode}
      onChange={handleChange}
      className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    >
      <option value="présentiel">Présentiel</option>
      <option value="en ligne">En ligne</option>
    </select>
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
            className="mt-1 p-4 border border-gray-300 rounded-md w-full"
    >
      <option value="inter(seminaire)">Inter-entreprise</option>
      <option value="intra">Intra-entreprise</option>
    </select>
  </div>
 
</div>
        

       

        
        <div className="mb-4">
         
            <div className="mb-4">
          <label className="block mt-4 text-center text-sm font-medium text-gray-700" htmlFor="description">
           Plus de détails ? 
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez vos besoins spécifiques..."
            className="mt-4 p-8 border border-gray-300 rounded-md w-full"
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

export default DemanderFormation;
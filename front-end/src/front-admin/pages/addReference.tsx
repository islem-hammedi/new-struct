import React, { useState } from 'react';
import axios from 'axios';

interface ReferenceFormData {
  nom: string;
  lien: string;
  secteur: string;
  logo: File | null;
}

const AddReferenceForm: React.FC = () => {
  const [formData, setFormData] = useState<ReferenceFormData>({
    nom: '',
    lien: '',
    secteur: '',
    logo: null
  });
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file
      }));

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setMessage('');

  try {
    const userDataString = localStorage.getItem('user');
    
    if (!userDataString) {
      throw new Error('Utilisateur non connecté');
    }

    const userData = JSON.parse(userDataString);
    const token = userData.token;
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const formDataToSend = new FormData();
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('lien', formData.lien);
    formDataToSend.append('secteur', formData.secteur);   
    if (formData.logo) {
      console.log('Ajout du fichier:', formData.logo.name, formData.logo.type, formData.logo.size);
      formDataToSend.append('logo', formData.logo);
    } else {
      console.log('Aucun fichier à ajouter');
    }
    console.log('Contenu du FormData:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key + ':', value);
    }

    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/apiAdmin/references`,
      formDataToSend,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setMessage('Référence ajoutée avec succès!');
    setFormData({ nom: '', lien: '',secteur:'', logo: null });
    setPreviewUrl('');

  } catch (error: any) {
    console.error('Erreur détaillée:', error);
    
    if (error.response?.status === 401) {
      setMessage('Session expirée. Veuillez vous reconnecter.');
    } else {
      setMessage(error.response?.data?.message || error.message || 'Erreur lors de l\'ajout');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl text-center font-bold mb-6 text-teal-600">Nos références</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            required
            maxLength={100}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            
          />
        </div>

        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Secteur d'activité *
          </label>
          <input
            type="text"
            id="secteur"
            name="secteur"
            value={formData.secteur}
            onChange={handleInputChange}
            required
            maxLength={30}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label htmlFor="lien" className="block text-sm font-medium text-gray-700">
            Lien de l'entreprise *
          </label>
          <input
            type="url"
            id="lien"
            name="lien"
            value={formData.lien}
            onChange={handleInputChange}
            required
            maxLength={100}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            Logo de l'entreprise
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleFileChange}
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
          />
        </div>

        {previewUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Aperçu:</label>
            <img 
              src={previewUrl} 
              alt="Aperçu du logo" 
              className="mt-2 w-32 h-32 object-contain border rounded"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Ajout en cours...' : 'Ajouter la référence'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AddReferenceForm;
{/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
interface DomaineTheme {
  domaine: string;
  theme: string[];
}
const AddFormateur: React.FC = () => {
  const [formData, setFormData] = useState<{ [key: string]: any }>({
    nom_complet: '',
    mail: '',
    adr: '',
    domaine_de_competences: [],
    themes_a_enseigner: [],
    tarif_journalier: '',
    nb_formations: '',
    tel: '',
    niveau_etude: '',
    nb_experience: '',
    horraire_jour: '',
    nom_banque: '',
    RIB: '',
    domaine_assistance: '',
    mdp_formateur: ''
  });
  const [domainesThemes, setDomainesThemes] = useState<{ [key: string]: string[] }>({});
  const navigate = useNavigate(); // Ajout du hook useNavigate
  const [cv, setCv] = useState<File | null>(null);
  const [fichePrg, setFichePrg] = useState<File[]>([]);
  const [coursSession, setCoursSession] = useState<File[]>([]);
  const [errors, setErrors] = useState<any>({});
  useEffect(() => {
    // Appel à l'API pour récupérer les domaines et thèmes associés
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaine-themes`)
      .then(response => {
        setDomainesThemes(response.data); // Réponse au format { domaine: [theme1, theme2, ...] }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des domaines et thèmes :", error);
      });
  }, []);
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
  
    setFormData({ ...formData, [name]: selectedValues });
  };
  
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'cv' && files) setCv(files[0]);
    if (name === 'fichePrg' && files){
      setFichePrg((prevFiles) => [...prevFiles, ...files]);
    }
    if (name === 'coursSession' && files) {
      setCoursSession((prevFiles) => [...prevFiles, ...files]);
    }

  };
  const validateRIB = (RIB: string): string | null => {
    const ribPattern = /^\d{5}\d{5}\d{11}\d{2}$/; // 5 + 5 + 11 + 2 = 23 chiffres
    if (!ribPattern.test(RIB)) {
      return "Le RIB doit contenir exactement 23 chiffres.";
    }
    return null; // Aucun problème
  };
  
  const validateForm = () => {
    const newErrors: any = {};
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!emailPattern.test(formData.mail)) {
      newErrors.mail = "Veuillez entrer un email valide.";
    }

    if (!/^\d{8}$/.test(formData.tel)) {
      newErrors.tel = "Le numéro de téléphone doit contenir exactement 8 chiffres.";
    }

    //const ribError = validateRIB(formData.RIB); // Ajout de la validation du RIB
    //f (ribError) newErrors.RIB = ribError;
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (validateForm()) {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key].length === 0 && (key === 'domaine_de_competences' || key === 'themes_a_enseigner')) {
          formDataToSend.append(key, ''); // Valeur vide pour les champs non sélectionnés
        } else {
          if (Array.isArray(formData[key])) {
            formData[key].forEach((item) => {
              formDataToSend.append(`${key}[]`, item);
            });
          } else {
            formDataToSend.append(key, formData[key]);
          }
              }
  });    
    if (cv) formDataToSend.append('cv', cv);
      
      if (fichePrg) {
        // Convert FileList to array and then use forEach
        Array.from(fichePrg).forEach((file) => {
          formDataToSend.append('fichePrg', file);
        });
      }
      
      try {
        await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
  
        console.log('Formateur ajouté avec succès');
        navigate('/Admin/formateurs');
      } catch (error: any) {
        console.error('Erreur lors de l\'ajout du formateur:', error.response?.data || error.message);
      }
    } else {
      console.log('Veuillez corriger les erreurs.');
    }
  };
  

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 border border-gray-300 bg-gray-100 rounded-lg mt-20">
      <h2 className="text-2xl font-bold mb-6">Ajouter un Formateur</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Nom complet :</label>
          <input type="text" name="nom_complet" placeholder="Nom complet" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Email :</label>
          <input type="email" name="mail" placeholder="Email" onChange={handleChange} required className="w-full p-2 border border-gray-300 rounded" />
          {errors.mail && <p className="text-red-500 text-sm mt-1">{errors.mail}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Adresse :</label>
          <input type="text" name="adr" placeholder="Adresse" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Téléphone :</label>
          <input type="text" name="tel" placeholder="Téléphone" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
          {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-gray-700">Mot de passe :</label>
          <input type="password" name="mdp_formateur" placeholder="Mot de passe" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
          {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Tarif journalier :</label>
          <input type="number" name="tarif_journalier" placeholder="Tarif journalier" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Nombre de formations :</label>
          <input type="number" name="nb_formations" placeholder="Nombre de formations" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-gray-700">Nombre d'Experiences :</label>
          <input type="number" name="nb_experience" placeholder="Nombre d'Experiences" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      
      <div className="mb-4">
        <label className="block text-gray-700"> Horraires par jour :</label>
        <textarea name="horraire_jour" placeholder="Horraires par jour" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">domaine de Compétences :</label>
        <select
          name="domaine_de_competences"
          onChange={handleMultiSelectChange}
          value={formData.domaine_de_competences}
          multiple
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Sélectionner un domaine</option>
          {Object.keys(domainesThemes).map((domaine, index) => (
            <option key={index} value={domaine}>
              {domaine}
            </option>
          ))}
        </select>    
         </div>

      <div className="mb-4">
        <label className="block text-gray-700">Thèmes à enseigner :</label>
        <select
          name="themes_a_enseigner"
          onChange={handleMultiSelectChange}
          value={formData.themes_a_enseigner}
          multiple
          className="w-full p-2 border border-gray-300 rounded"
        >
          {formData.domaine_de_competences.flatMap(domaine => domainesThemes[domaine] || []).map((theme, index) => (
          <option key={index} value={theme}>{theme}</option>
        ))}
        </select>    </div>
      <div className="mb-4">
        <label className="block text-gray-700">domaine de Compétences au niveau d'assistance :</label>
        <textarea name="domaine_assistance" placeholder="domaine de Compétences au niveau d'assistance" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Niveau d'Etude:</label>
        <textarea name="niveau_etude" placeholder="Niveau d'Etude" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Nom du Banque :</label>
        <textarea name="nom_banque" placeholder="Nom du Banque" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">RIB :</label>
        <textarea name="RIB" placeholder="RIB" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
        {errors.RIB && <p className="text-red-500 text-sm mt-1">{errors.RIB}</p>}

      </div>
      <div className="mb-4">
        <label className="block text-gray-700">CV :</label>
        <input type="file" name="cv" accept=".pdf" onChange={handleFileChange} className="mt-2" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">fiche programme :</label>
        <input type="file" name="fichePrg" accept=".pdf" onChange={handleFileChange} className="mt-2" multiple />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Cours des sessions :</label>
        <input type="file" name="coursSession" accept=".pdf" onChange={handleFileChange} className="mt-2" multiple />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">retour sur le formateur :</label>
        <textarea name="retour_sacConsulting " placeholder="votre retour sur le formateur " onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>

      <button type="submit" className="bg-blue-700 hover:bg-blue-500 text-white py-2 px-4 rounded w-full mt-4">Ajouter</button>
    </form>
    </>
  );
};

export default AddFormateur;*/}
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface DomaineTheme {
  domaine: string;
  theme: string[];
}

const AddFormateur: React.FC = () => {
  const [formData, setFormData] = useState({
    nom_complet: '',
    mail: '',
    adr: '',
    domaine_de_competences: [] as string[],
    themes_a_enseigner: [] as string[],
    tarif_journalier: '',
    nb_formations: '',
    tel: '',
    niveau_etude: '',
    nb_experience: '',
    horraire_jour: '',
    nom_banque: '',
    RIB: '',
    domaine_assistance: '',
    mdp_formateur: '',
    retour_sacConsulting: 'Aucun retour'
  });

  const [domainesThemes, setDomainesThemes] = useState<{ [key: string]: string[] }>({});
  const navigate = useNavigate();
  const [cv, setCv] = useState<File | null>(null);
  const [fichePrg, setFichePrg] = useState<File[]>([]);
  const [coursSession, setCoursSession] = useState<File[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaine-themes`)
      .then(response => {
        setDomainesThemes(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des domaines et thèmes :", error);
      });
  }, []);

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
  
    setFormData({ ...formData, [name]: selectedValues });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files) return;

    if (name === 'cv') setCv(files[0]);
    if (name === 'fichePrg') setFichePrg([...fichePrg, ...Array.from(files)]);
    if (name === 'coursSession') setCoursSession([...coursSession, ...Array.from(files)]);
  };

  const validateForm = () => {
    const newErrors: any = {};
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!formData.nom_complet.trim()) newErrors.nom_complet = "Nom complet requis";
    if (!emailPattern.test(formData.mail)) newErrors.mail = "Email invalide";
    if (!/^\d{8}$/.test(formData.tel)) newErrors.tel = "8 chiffres requis";
    if (!formData.mdp_formateur) newErrors.mdp_formateur = "Mot de passe requis";
    if (formData.domaine_de_competences.length === 0) newErrors.domaine_de_competences = "Sélectionnez au moins un domaine";
    if (formData.themes_a_enseigner.length === 0) newErrors.themes_a_enseigner = "Sélectionnez au moins un thème";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    
    const formDataForApi = {
      ...formData,
      domaine_de_competences: JSON.stringify(formData.domaine_de_competences),
      themes_a_enseigner: JSON.stringify(formData.themes_a_enseigner)
    };

    Object.entries(formDataForApi).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    if (cv) formDataToSend.append('cv', cv);
    fichePrg.forEach(file => formDataToSend.append('fiche_programme', file));
    coursSession.forEach(file => formDataToSend.append('cours_session', file));

    try {
      await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/Admin/formateurs');
    } catch (error: any) {
      console.error('Erreur:', error.response?.data || error.message);
      alert(error.response?.data?.message || "Erreur lors de l'ajout du formateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 border border-gray-300 bg-gray-100 rounded-lg mt-20">
      <h2 className="text-2xl font-bold mb-6">Ajouter un Formateur</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700">Nom complet *</label>
            <input
              type="text"
              name="nom_complet"
              value={formData.nom_complet}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {errors.nom_complet && <p className="text-red-500 text-sm">{errors.nom_complet}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Email *</label>
            <input
              type="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            {errors.mail && <p className="text-red-500 text-sm">{errors.mail}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Adresse :</label>
          <input type="text" name="adr" placeholder="Adresse" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Téléphone :</label>
          <input type="text" name="tel" placeholder="Téléphone" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
          {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-gray-700">Mot de passe :</label>
          <input type="password" name="mdp_formateur" placeholder="Mot de passe" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
          {errors.tel && <p className="text-red-500 text-sm mt-1">{errors.tel}</p>}
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700">Tarif journalier :</label>
          <input type="number" name="tarif_journalier" placeholder="Tarif journalier" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Nombre de formations :</label>
          <input type="number" name="nb_formations" placeholder="Nombre de formations" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      </div>
      <div className="mb-4">
          <label className="block text-gray-700">Nombre d'Experiences :</label>
          <input type="number" name="nb_experience" placeholder="Nombre d'Experiences" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded" />
        </div>
      
      <div className="mb-4">
        <label className="block text-gray-700"> Horraires par jour :</label>
        <textarea name="horraire_jour" placeholder="Horraires par jour" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">domaine de Compétences :</label>
        <select
          name="domaine_de_competences"
          onChange={handleMultiSelectChange}
          value={formData.domaine_de_competences}
          multiple
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Sélectionner un domaine</option>
          {Object.keys(domainesThemes).map((domaine, index) => (
            <option key={index} value={domaine}>
              {domaine}
            </option>
          ))}
        </select>    
         </div>

      <div className="mb-4">
        <label className="block text-gray-700">Thèmes à enseigner :</label>
        <select
          name="themes_a_enseigner"
          onChange={handleMultiSelectChange}
          value={formData.themes_a_enseigner}
          multiple
          className="w-full p-2 border border-gray-300 rounded"
        >
          {formData.domaine_de_competences.flatMap(domaine => domainesThemes[domaine] || []).map((theme, index) => (
          <option key={index} value={theme}>{theme}</option>
        ))}
        </select>    </div>
      <div className="mb-4">
        <label className="block text-gray-700">domaine de Compétences au niveau d'assistance :</label>
        <textarea name="domaine_assistance" placeholder="domaine de Compétences au niveau d'assistance" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Niveau d'Etude:</label>
        <textarea name="niveau_etude" placeholder="Niveau d'Etude" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Nom du Banque :</label>
        <textarea name="nom_banque" placeholder="Nom du Banque" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">RIB :</label>
        <textarea name="RIB" placeholder="RIB" onChange={handleChange} className="w-full p-2 border border-gray-300 rounded"></textarea>
        {errors.RIB && <p className="text-red-500 text-sm mt-1">{errors.RIB}</p>}

      </div>
      <div className="mb-4">
        <label className="block text-gray-700">CV :</label>
        <input type="file" name="cv" accept=".pdf" onChange={handleFileChange} className="mt-2" />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">fiche programme :</label>
        <input type="file" name="fiche_programme" accept=".pdf" onChange={handleFileChange} className="mt-2" multiple />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Cours des sessions :</label>
        <input type="file" name="cours_session" accept=".pdf" onChange={handleFileChange} className="mt-2" multiple />
      </div>
      
      <div className="mb-4 col-span-2">
            <label className="block text-gray-700">Retour sur le formateur</label>
            <textarea
              name="retour_sacConsulting"
              value={formData.retour_sacConsulting}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Votre évaluation du formateur"
            />
          </div>
          </div>

<button 
  type="submit" 
  className="bg-teal-500 hover:bg-teal-700 text-white py-2 px-4 rounded w-full mt-4"
>
  Ajouter
</button>
</form>
</div>
);
};

export default AddFormateur;
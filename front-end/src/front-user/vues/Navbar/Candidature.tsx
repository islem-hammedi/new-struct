

import axios from "axios";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsVisible(true), delay * 300);
      return () => clearTimeout(timer);
    }
  }, [inView, delay]);

  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {children}
    </div>
  );
};

interface FormData {
  nom: string;
  telephone: string;
  email: string;
  domaine: string;
  themes: string;
  motivation: string;
  cv: File | null;
  certificats: File | null;
}

const SoumettreCandidature: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    telephone: '',
    email: '',
    domaine: '',
    themes: '',
    motivation: '',
    cv: null,
    certificats: null
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
        if (!formData.nom || !formData.telephone || !formData.email || 
            !formData.domaine || !formData.themes || !formData.motivation || !formData.cv) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('nom', formData.nom);
        formDataToSend.append('telephone', formData.telephone);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('domaine', formData.domaine);
        formDataToSend.append('themes', formData.themes);
        formDataToSend.append('motivation', formData.motivation);
        formDataToSend.append('cv', formData.cv);
        
        if (formData.certificats) {
            formDataToSend.append('certificats', formData.certificats);
        }

        const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/apiUser/formateur-candidatures`,
            formDataToSend,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        setFormData({
            nom: '',
            telephone: '',
            email: '',
            domaine: '',
            themes: '',
            motivation: '',
            cv: null,
            certificats: null
        });

        alert('Candidature soumise avec succès!');

    } catch (error) {
        console.error('Erreur:', error);
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || error.message;
            alert(`Erreur: ${errorMessage}`);
        } else {
            if (error instanceof Error) {
                alert(`Erreur: ${error.message}`);
            } else {
                alert('Une erreur inconnue est survenue.');
            }
        }
    }
};

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 border-t border-emerald-100 w-screen relative left-1/2 right-1/2 mx-[-50vw]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-semibold text-center text-emerald-600/80 mb-8">
          Devenir Formateur chez SAC Consulting
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <AnimatedText delay={0}>
              <div className="bg-emerald-50/50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-emerald-700 mb-4">
                  Partagez votre expertise avec nous
                </h3>
                <p className="text-gray-700 mb-4">
                  Nous recherchons en permanence des formateurs passionnés et expérimentés 
                  pour rejoindre notre équipe. Si vous avez une expertise dans un domaine 
                  spécifique et que vous souhaitez transmettre vos connaissances, nous 
                  serions ravis d'étudier votre candidature.
                </p>
                <p className="text-gray-700 mb-4">
                  En tant que formateur chez SAC Consulting, vous bénéficierez :
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>D'un réseau de clients prestigieux</li>
                  <li>D'un accompagnement dans la préparation de vos sessions</li>
                  <li>D'une rémunération attractive</li>
                  <li>D'opportunités de développement professionnel</li>
                </ul>
              </div>
            </AnimatedText>
          </div>
          
          <div className="md:w-1/2">
            <AnimatedText delay={0.5}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Domaine de compétence *</label>
                  <input
                    type="text"
                    name="domaine"
                    value={formData.domaine}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Thèmes que vous souhaitez enseigner *</label>
                  <textarea
                    name="themes"
                    value={formData.themes}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Pourquoi souhaitez-vous rejoindre notre centre ? *</label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">CV (PDF) *</label>
                  <input
                    type="file"
                    name="cv"
                    onChange={handleChange}
                    required
                    accept=".pdf"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Certificats (PDF, optionnel)</label>
                  <input
                    type="file"
                    name="certificats"
                    onChange={handleChange}
                    accept=".pdf"
                    multiple
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Soumettre ma candidature
                  </button>
                </div>
              </form>
            </AnimatedText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoumettreCandidature;
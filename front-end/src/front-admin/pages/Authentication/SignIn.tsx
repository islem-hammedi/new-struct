import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthAdmin';
import axios from 'axios';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import LogoDark from '/image.png';
import Logo from '/image.png';

const SignIn = () => {
  const [formData, setFormData] = useState({ nom_admin: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const { nom_admin, password } = formData;
    if (!nom_admin || !password ) {
      setError('Tous les champs sont requis');
      return;
    }
  
    if (password.length < 6 || !/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins 6 caractères et 1 majuscule');
      return;
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/auth/login`,
        formData,
        { withCredentials: true }
      );
  
  
      const { id_admin, nom_admin, token, telephone, poste, acces } = response.data;
  
      if (id_admin && nom_admin && token) {
        console.log('id_admin:', id_admin, 'Nom Admin:', nom_admin, 'Token:', token, 'Accès:', acces);
  
        // Sauvegarde dans localStorage
        localStorage.setItem('token', token);
        localStorage.setItem(
          'user',
          JSON.stringify({ id_admin, nom_admin, telephone, poste, acces })
        );
        document.cookie = `token=${token}; Path=/; Secure; HttpOnly; SameSite=Strict`;
  
        // Passe directement les données de la réponse à login
        login(response.data);
        navigate('/Admin/chart');
      } else {
        setError('Les informations d\'utilisateur sont invalides.');
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.response?.data?.message || 'Erreur de connexion.');
    }
  };
  
  

  return (
    <>
      <Breadcrumb pageName="Authentification" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="/">
                <img className="hidden dark:block" src={Logo} alt="Logo" />
                <img className="dark:hidden" src={LogoDark} alt="Logo" />
              </Link>
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Connectez-vous à sac-consulting Admin
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">Nom Admin</label>
                  <input
                    type="text"
                    name="nom_admin"
                    placeholder="Entrez votre nom"
                    value={formData.nom_admin}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="6+ caractères, 1 majuscule"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-stroke py-4 pl-6 pr-10 text-black dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="mb-5">
                  <input
                    type="submit"
                    value="Se connecter"
                    className="w-full cursor-pointer rounded-lg border bg-primary p-4 text-white"
                  />
                </div>

                <div className="mt-6 text-center">
                  <p>
                    Vous n'avez pas encore de compte ?{' '}
                    <Link to="/NewAdmin" className="text-primary">
                      Créer admin
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
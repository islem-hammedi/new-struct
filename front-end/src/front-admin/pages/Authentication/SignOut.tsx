import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthAdmin'; // Assurez-vous d'importer le hook useAuth

const SignOut = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      document.cookie = 'token=; Max-Age=-99999999; Path=/; Secure; HttpOnly; SameSite=Strict';

      localStorage.removeItem('user');

      logout();

      navigate('/Admin/signin');
    };

    handleLogout();
  }, [logout, navigate]);

};

export default SignOut;
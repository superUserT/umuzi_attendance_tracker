import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoginForm from './LoginForm';

export default function AdminLogin() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin');
  };

  return (
    <LoginForm
      title="Admin Login"
      onLogin={login}
      onSuccess={handleSuccess}
    />
  );
}
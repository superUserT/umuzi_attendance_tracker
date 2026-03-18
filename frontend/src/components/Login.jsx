import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoginForm from './LoginForm';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin');
  };

  return (
    <LoginForm
      title="Login"
      onLogin={login}
      onSuccess={handleSuccess}
    />
  );
};

export default Login;

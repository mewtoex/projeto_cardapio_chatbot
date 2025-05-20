// src/modules/auth/pages/ClientRegisterPage.tsx
import React from 'react';
import ClientRegisterForm from '../components/ClientRegisterForm';
import { Link } from 'react-router-dom';

const ClientRegisterPage: React.FC = () => {
  return (
    <div>
      <h1>Crie sua Conta</h1>
      <ClientRegisterForm />
      <p>
        Já possui uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
};

export default ClientRegisterPage;


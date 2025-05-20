// src/modules/auth/pages/ClientLoginPage.tsx
import React from 'react';
import ClientLoginForm from '../components/ClientLoginForm';
import { Link } from 'react-router-dom';

const ClientLoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login do Cliente</h1>
      <ClientLoginForm />
      <p>
        Ainda não tem uma conta? <Link to="/register">Cadastre-se aqui</Link>
      </p>
      {/* TODO: Add link to password recovery page */}
    </div>
  );
};

export default ClientLoginPage;


// src/modules/client/pages/ClientDashboardPage.tsx
import React from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';

const ClientDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard do Cliente</h1>
      {user && <p>Bem-vindo, {user.name}!</p>}
      <p>Aqui você poderá ver seu histórico de pedidos, cardápio, etc.</p>
      {/* Placeholder for client dashboard content */}
      <button onClick={logout}>Sair</button>
    </div>
  );
};

export default ClientDashboardPage;


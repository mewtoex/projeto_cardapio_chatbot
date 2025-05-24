// src/modules/admin/dashboard/pages/AdminDashboardPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../auth/contexts/AuthContext";
import ApiService from "../../../shared/services/ApiService"; 
import { Link } from "react-router-dom";

// Dummy data types for dashboard, replace with actual types
interface DashboardStats {
  newOrders: number;
  inPreparationOrders: number;
  outForDeliveryOrders: number;
  completedToday: number;
  averageSale: number;
  // Add more stats as needed
}

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 700));
        setStats(null);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao buscar dados do dashboard.");
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Carregando dashboard...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Erro: {error}</p>;
  }

  return (
    <div>
      <h1>Dashboard do Administrador</h1>
      {user && <p>Bem-vindo, {user.name} (Admin)!</p>}
      
      {stats ? (
        <div style={{display: "flex", flexWrap: "wrap", gap: "20px"}}>
          <div style={{border: "1px solid #ccc", padding: "15px", minWidth: "200px"}}>
            <h3>Novos Pedidos</h3>
            <p style={{fontSize: "2em"}}>{stats.newOrders}</p>
            <Link to="/admin/orders?status=novo">Ver Pedidos</Link>
          </div>
          <div style={{border: "1px solid #ccc", padding: "15px", minWidth: "200px"}}>
            <h3>Em Preparo</h3>
            <p style={{fontSize: "2em"}}>{stats.inPreparationOrders}</p>
            <Link to="/admin/orders?status=em_preparo">Ver Pedidos</Link>
          </div>
          <div style={{border: "1px solid #ccc", padding: "15px", minWidth: "200px"}}>
            <h3>Saiu para Entrega</h3>
            <p style={{fontSize: "2em"}}>{stats.outForDeliveryOrders}</p>
            <Link to="/admin/orders?status=saiu_para_entrega">Ver Pedidos</Link>
          </div>
          <div style={{border: "1px solid #ccc", padding: "15px", minWidth: "200px"}}>
            <h3>Concluídos Hoje</h3>
            <p style={{fontSize: "2em"}}>{stats.completedToday}</p>
            {/* Link to a report or filtered list */}
          </div>
          <div style={{border: "1px solid #ccc", padding: "15px", minWidth: "200px"}}>
            <h3>Média de Venda (Hoje)</h3>
            <p style={{fontSize: "2em"}}>R$ {stats.averageSale.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <p>Nenhuma estatística disponível.</p>
      )}

      <div style={{marginTop: "30px"}}>
        <h2>Ações Rápidas</h2>
        <ul>
            <li><Link to="/admin/orders">Gerenciar Pedidos</Link></li>
            <li><Link to="/admin/items">Gerenciar Itens do Cardápio</Link></li>
            {/* Add more links as needed, e.g., Gerenciar Clientes, Promoções */}
        </ul>
      </div>

      <button onClick={logout} style={{marginTop: "20px"}}>Sair</button>
    </div>
  );
};

export default AdminDashboardPage;


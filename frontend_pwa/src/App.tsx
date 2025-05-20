// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { AppNotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./modules/auth/contexts/AuthContext";

// Auth Pages
import ClientLoginPage from "./modules/auth/pages/ClientLoginPage";
import ClientRegisterPage from "./modules/auth/pages/ClientRegisterPage";
import AdminLoginPage from "./modules/admin/auth/pages/AdminLoginPage";

// Client Pages
import ClientDashboardPage from "./modules/client/pages/ClientDashboardPage";
import ClientOrderHistoryPage from "./modules/client/pages/ClientOrderHistoryPage";
import ClientMenuPage from "./modules/client/pages/ClientMenuPage";
import ClientCartPage from "./modules/client/pages/ClientCartPage";
import ClientCheckoutPage from "./modules/client/pages/ClientCheckoutPage";

// Admin Pages
import AdminDashboardPage from "./modules/admin/dashboard/pages/AdminDashboardPage";
import AdminOrderManagementPage from "./modules/admin/pedidos/pages/AdminOrderManagementPage";
import AdminItemManagementPage from "./modules/admin/itens/pages/AdminItemManagementPage";

// Layout and Routes
import { MainLayout } from "./components/Layout/MainLayout";
import ProtectedRoute from "./router/ProtectedRoute";

// Página inicial temporária para desenvolvimento
const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sistema de Cardápio Online</h1>
      <p>Bem-vindo ao sistema de cardápio. Por favor, escolha uma opção:</p>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div>
          <h2>Área do Cliente</h2>
          <ul>
            <li><a href="/login">Login de Cliente</a></li>
            <li><a href="/register">Cadastro de Cliente</a></li>
            <li><a href="/client/menu">Ver Cardápio (Modo Demonstração)</a></li>
          </ul>
        </div>
        
        <div>
          <h2>Área Administrativa</h2>
          <ul>
            <li><a href="/admin/login">Login de Administrador</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppNotificationProvider>
          <Router>
            <Routes>
              {/* Página inicial temporária para desenvolvimento */}
              <Route path="/" element={<HomePage />} />
              
              {/* Rotas de autenticação */}
              <Route path="/login" element={<ClientLoginPage />} />
              <Route path="/register" element={<ClientRegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Rota de demonstração do cardápio sem autenticação */}
              <Route path="/client/menu" element={
                <MainLayout>
                  <ClientMenuPage />
                </MainLayout>
              } />

              {/* Rotas protegidas do cliente com layout principal */}
              <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
                <Route path="/client/dashboard" element={
                  <MainLayout>
                    <ClientDashboardPage />
                  </MainLayout>
                } />
                <Route path="/client/orders" element={
                  <MainLayout>
                    <ClientOrderHistoryPage />
                  </MainLayout>
                } />
                <Route path="/client/cart" element={
                  <MainLayout>
                    <ClientCartPage />
                  </MainLayout>
                } />
                <Route path="/client/checkout" element={
                  <MainLayout>
                    <ClientCheckoutPage />
                  </MainLayout>
                } />
              </Route>

              {/* Rotas protegidas do admin com layout principal */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={
                  <MainLayout>
                    <AdminDashboardPage />
                  </MainLayout>
                } />
                <Route path="/admin/orders" element={
                  <MainLayout>
                    <AdminOrderManagementPage />
                  </MainLayout>
                } />
                <Route path="/admin/items" element={
                  <MainLayout>
                    <AdminItemManagementPage />
                  </MainLayout>
                } />
              </Route>

              {/* Rota para página não encontrada */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AppNotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

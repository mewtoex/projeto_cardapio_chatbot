// frontend_pwa/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Seu tema Material-UI
import MainLayout from './components/Layout/MainLayout';
import { AuthProvider } from './modules/auth/contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './router/ProtectedRoute';

// Páginas do Cliente
import ClientMenuPage from './modules/client/pages/ClientMenuPage';
import ClientCartPage from './modules/client/pages/ClientCartPage';
import ClientCheckoutPage from './modules/client/pages/ClientCheckoutPage';
import ClientOrderHistoryPage from './modules/client/pages/ClientOrderHistoryPage';
import ClientOrderItemPage from './modules/client/pages/ClientOrderItemPage';
import ClientDashboardPage from './modules/client/pages/ClientDashboardPage';
import ClientProfilePage from './modules/client/profile/pages/ClientProfilePage'; // Nova página de perfil

// Páginas de Autenticação
import UnifiedLoginPage from './modules/auth/pages/UnifiedLoginPage';
import ClientRegisterPage from './modules/auth/pages/ClientRegisterPage';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';

// Páginas do Admin
import AdminDashboardPage from './modules/admin/dashboard/pages/AdminDashboardPage';
import AdminItemManagementPage from './modules/admin/itens/pages/AdminItemManagementPage';
import AdminOrderManagementPage from './modules/admin/pedidos/pages/AdminOrderManagementPage';
import AdminStoreManagementPage from './modules/admin/loja/pages/AdminStoreManagementPage';
import AdminDeliveryAreaManagementPage from './modules/admin/delivery/pages/AdminDeliveryAreaManagementPage';
import AdminBotMessagesPage from './modules/admin/bot_messages/pages/AdminBotMessagesPage';

// Página de Erro (Ex: 404)
import NotFoundPage from './components/common/NotFoundPage'; // Você precisaria criar este

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Rotas de Autenticação */}
              <Route path="/login" element={<UnifiedLoginPage />} />
              <Route path="/register" element={<ClientRegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

              {/* Rotas Públicas */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<ClientMenuPage />} /> {/* Página inicial agora é o cardápio */}
                <Route path="cardapio" element={<ClientMenuPage />} />
              </Route>

              {/* Rotas Protegidas para Clientes */}
              <Route path="/client" element={<ProtectedRoute allowedRoles={['cliente']} />}>
                <Route element={<MainLayout />}>
                  <Route path="dashboard" element={<ClientDashboardPage />} />
                  <Route path="carrinho" element={<ClientCartPage />} />
                  <Route path="checkout" element={<ClientCheckoutPage />} />
                  <Route path="pedidos" element={<ClientOrderHistoryPage />} />
                  <Route path="pedidos/:orderId" element={<ClientOrderItemPage />} />
                  <Route path="perfil" element={<ClientProfilePage />} />
                </Route>
              </Route>

              {/* Rotas Protegidas para Admin */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<MainLayout isAdmin />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="itens" element={<AdminItemManagementPage />} />
                  <Route path="pedidos" element={<AdminOrderManagementPage />} />
                  <Route path="loja" element={<AdminStoreManagementPage />} />
                  <Route path="entregas" element={<AdminDeliveryAreaManagementPage />} />
                  <Route path="mensagens-bot" element={<AdminBotMessagesPage />} />
                </Route>
              </Route>

              {/* Rota para página não encontrada */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
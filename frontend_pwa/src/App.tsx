// frontend_pwa/src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { AppNotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./modules/auth/contexts/AuthContext";

// Auth Pages
import UnifiedLoginPage from "./modules/auth/pages/UnifiedLoginPage";
import ClientRegisterPage from "./modules/auth/pages/ClientRegisterPage";
// NOVO: Páginas de recuperação de senha
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";

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
import AdminBotMessagesPage from "./modules/admin/bot_messages/pages/AdminBotMessagesPage";
import AdminStoreManagementPage from "./modules/admin/loja/pages/AdminStoreManagementPage"; 
import AdminDeliveryAreaManagementPage from "./modules/admin/delivery/pages/AdminDeliveryAreaManagementPage"; 

// Layout and Routes
import { MainLayout } from "./components/Layout/MainLayout";
import ProtectedRoute from "./router/ProtectedRoute";

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppNotificationProvider>
          <Router>
            <Routes>
              {/* Rota inicial agora direciona para o cardápio */}
              <Route path="/" element={<Navigate to="/client/menu" replace />} />
              
              {/* Rota unificada de login */}
              <Route path="/login" element={<UnifiedLoginPage />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/register" element={<ClientRegisterPage />} />

              {/* NOVAS ROTAS DE RECUPERAÇÃO DE SENHA */}
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* Para capturar o token da URL */}


              {/* Rota do cardápio acessível sem autenticação */}
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
                <Route path="/admin/bot-messages" element={ 
                  <MainLayout>
                    <AdminBotMessagesPage />
                  </MainLayout>
                } />
                <Route path="/admin/store" element={ // New Admin Route
                  <MainLayout>
                    <AdminStoreManagementPage />
                  </MainLayout>
                } />
                <Route path="/admin/delivery-areas" element={ // New Admin Route
                  <MainLayout>
                    <AdminDeliveryAreaManagementPage />
                  </MainLayout>
                } />
              </Route>

              {/* Rota para página não encontrada (redireciona para o cardápio) */}
              <Route path="*" element={<Navigate to="/client/menu" replace />} />
            </Routes>
          </Router>
        </AppNotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
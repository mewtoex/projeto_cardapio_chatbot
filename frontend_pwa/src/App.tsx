// frontend_pwa/src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./theme";
import { AppNotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./modules/auth/contexts/AuthContext";

// Auth Pages
// import ClientLoginPage from "./modules/auth/pages/ClientLoginPage"; // Remover esta importação
// import AdminLoginPage from "./modules/admin/auth/pages/AdminLoginPage"; // Remover esta importação
import UnifiedLoginPage from "./modules/auth/pages/UnifiedLoginPage"; // Adicionar esta nova página

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
import ClientRegisterPage from "./modules/auth/pages/ClientRegisterPage";

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
              <Route path="/admin/login" element={<Navigate to="/login" replace />} /> {/* Redireciona admin para o login unificado */}
              <Route path="/register" element={<ClientRegisterPage />} />


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
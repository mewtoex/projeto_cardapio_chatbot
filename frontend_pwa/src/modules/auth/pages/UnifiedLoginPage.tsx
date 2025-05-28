// frontend_pwa/src/modules/auth/pages/UnifiedLoginPage.tsx
import React, { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab, Paper } from '@mui/material';
import ClientLoginForm from '../components/ClientLoginForm';
import AdminLoginForm from '../../admin/auth/components/AdminLoginForm';
import { Link } from 'react-router-dom';

const UnifiedLoginPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        bgcolor: 'background.default', 
        p: 3 
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Bem-vindo! Faça Login
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Cliente" />
          <Tab label="Administrador" />
        </Tabs>

        {tabValue === 0 && <ClientLoginForm />}
        {tabValue === 1 && <AdminLoginForm />}
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Ainda não tem uma conta de cliente? <Link to="/register">Cadastre-se aqui</Link>
          </Typography>
          {/* Se houver recuperação de senha, adicione o link aqui */}
          {/* <Typography variant="body2" sx={{ mt: 1 }}>
            <Link to="/forgot-password">Esqueceu a senha?</Link>
          </Typography> */}
        </Box>
      </Paper>
    </Box>
  );
};

export default UnifiedLoginPage;
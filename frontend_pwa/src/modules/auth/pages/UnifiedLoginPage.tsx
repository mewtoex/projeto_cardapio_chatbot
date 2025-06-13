import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Tabs, Tab } from '@mui/material';
import ClientLoginForm from '../components/ClientLoginForm';
import AdminLoginForm from '../../admin/auth/components/AdminLoginForm';

const UnifiedLoginPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0); // 0 for Client, 1 for Admin

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" mb={2}>
          Bem-vindo!
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', mb: 2 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="Login Tabs" centered>
            <Tab label="Entrar como Cliente" />
            <Tab label="Entrar como Admin" />
          </Tabs>
        </Box>

        {currentTab === 0 && <ClientLoginForm />}
        {currentTab === 1 && <AdminLoginForm />}
      </Paper>
    </Container>
  );
};

export default UnifiedLoginPage;
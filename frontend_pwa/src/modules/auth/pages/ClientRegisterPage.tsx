// frontend_pwa/src/modules/auth/pages/ClientRegisterPage.tsx
import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import ClientRegisterForm from '../components/ClientRegisterForm'; // Importa o formulário separado

const ClientRegisterPage: React.FC = () => {
  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" mb={2}>
          Criar Nova Conta
        </Typography>
        <ClientRegisterForm />
      </Paper>
    </Container>
  );
};

export default ClientRegisterPage;
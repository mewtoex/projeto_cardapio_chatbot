// src/modules/auth/pages/ClientRegisterPage.tsx
import React from 'react';
import ClientRegisterForm from '../components/ClientRegisterForm';
import { Link } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material'; // Importar Box e Paper

const ClientRegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', borderRadius: 2 }}> {/* Aumentado maxWidth para acomodar o formulário de registro */}
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Crie sua Conta
        </Typography>
        <ClientRegisterForm />
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Já possui uma conta? <Link to="/login">Faça Login</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClientRegisterPage;
// src/modules/admin/auth/components/AdminLoginForm.tsx
import React, { useState } from "react";
import AuthService from "../../../shared/services/AuthService";
import { useAuth } from "../../../auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from '@mui/material'; // Importar Paper para o estilo

const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.adminLogin(email, password);
      login(response.user, response.access_token); // Corrigido para access_token, como em AuthService
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro no login.");
    }
    setLoading(false);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        mt: 1, 
        p: 3, // Adiciona padding dentro do formulário
        borderRadius: 2, // Borda arredondada
      }}
    >
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <TextField
        margin="normal"
        required
        fullWidth
        id="admin-email"
        label="Email do Administrador"
        name="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha do Administrador"
        type="password"
        id="admin-password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? "Entrando..." : "Entrar como Administrador"}
      </Button>
    </Box>
  );
};

export default AdminLoginForm;
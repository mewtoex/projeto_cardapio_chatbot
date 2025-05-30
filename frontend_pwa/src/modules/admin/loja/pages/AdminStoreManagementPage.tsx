// src/modules/admin/store/pages/AdminStoreManagementPage.tsx
import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from "@mui/material";
import ApiService from "../../../shared/services/ApiService";
import { useNotification } from "../../../../contexts/NotificationContext";

interface Address {
  id?: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  cep: string;
}

interface Store {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address_id?: string;
  address?: Address;
}

const AdminStoreManagementPage: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notification = useNotification();

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getMyStore();
      setStore(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao buscar dados da loja.");
      notification.showError('Erro ao carregar dados da loja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setStore(prev => ({
        ...prev!,
        address: {
          ...prev!.address!,
          [name.split(".")[1]]: value
        }
      }));
    } else {
      setStore(prev => ({
        ...prev!,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    if (!store) return;

    // Basic validation
    if (!store.name || !store.phone || !store.email || !store.address?.street || !store.address?.number || !store.address?.district || !store.address?.city || !store.address?.state || !store.address?.cep) {
      notification.showError("Por favor, preencha todos os campos obrigatórios da loja e do endereço.");
      return;
    }

    setIsSaving(true);
    try {
      if (store.id) {
        // Update existing store
        await ApiService.updateMyStore(store);
        notification.showSuccess("Dados da loja atualizados com sucesso!");
      } else {
        // Create new store
        await ApiService.createMyStore(store);
        notification.showSuccess("Loja cadastrada com sucesso!");
      }
      fetchStoreData(); // Re-fetch to get updated IDs if created
    } catch (err) {
      notification.showError(err instanceof Error ? err.message : "Erro ao salvar dados da loja.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando dados da loja...</Typography>
      </Box>
    );
  }

  if (error && !store) { // Show error only if no store data exists
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro: {error}. Por favor, verifique sua conexão ou se a loja já foi cadastrada.
        </Alert>
        <Button variant="contained" onClick={fetchStoreData}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gerenciar Minha Loja
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações da Loja
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome da Loja"
              name="name"
              value={store?.name || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={store?.phone || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={store?.email || ''}
              onChange={handleInputChange}
              margin="normal"
              type="email"
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Endereço da Loja
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CEP"
              name="address.cep"
              value={store?.address?.cep || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Rua/Avenida"
              name="address.street"
              value={store?.address?.street || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Número"
              name="address.number"
              value={store?.address?.number || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Complemento"
              name="address.complement"
              value={store?.address?.complement || ''}
              onChange={handleInputChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bairro"
              name="address.district"
              value={store?.address?.district || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cidade"
              name="address.city"
              value={store?.address?.city || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Estado"
              name="address.state"
              value={store?.address?.state || ''}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Grid>
        </Grid>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSaving}
        sx={{ mt: 2 }}
      >
        {isSaving ? "Salvando..." : (store?.id ? "Atualizar Loja" : "Cadastrar Loja")}
      </Button>
    </Box>
  );
};

export default AdminStoreManagementPage;
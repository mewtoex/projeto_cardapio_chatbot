// frontend_pwa/src/modules/admin/loja/pages/AdminStoreManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, CircularProgress, Alert, Card, CardContent,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Store as StoreIcon, Save as SaveIcon } from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import StoreForm from '../components/StoreForm'; // Novo componente de formulário
import { type Store } from '../../../../types';

const AdminStoreManagementPage: React.FC = () => {
  const notification = useNotification();
  const {
    data: storeData,
    loading,
    error,
    execute: fetchStoreData,
    setData: setStoreDataManually,
  } = useLoading<Store | null>(); // Pode retornar null se a loja ainda não estiver configurada

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    await fetchStoreData(
      api.getMyStore(), // API para buscar dados da loja do admin
      undefined,
      "Erro ao carregar dados da loja."
    );
  };

  const handleOpenForm = () => {
    setIsFormModalOpen(true);
  };

  const handleSaveStore = async (data: Store) => {
    try {
      let savedStore: Store;
      if (storeData) {
        // Se já existe, atualiza
        savedStore = await api.updateMyStore(data);
        notification.showSuccess("Informações da loja atualizadas com sucesso!");
      } else {
        // Se não existe, cria
        savedStore = await api.createMyStore(data);
        notification.showSuccess("Loja configurada com sucesso!");
      }
      setStoreDataManually(savedStore);
      setIsFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar informações da loja.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações da Loja
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Defina os detalhes e o horário de funcionamento do seu restaurante.
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          <Typography variant="h6">Erro ao carregar dados da loja:</Typography>
          <Typography>{error}</Typography>
          <Button onClick={loadStoreData} sx={{ mt: 1 }}>Tentar novamente</Button>
        </Alert>
      )}

      {!loading && !error && (
        storeData ? (
          <Card elevation={3} sx={{ p: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Dados Atuais da Loja
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleOpenForm}
                >
                  Editar Dados
                </Button>
              </Box>
              <Typography variant="body1"><strong>Nome:</strong> {storeData.name}</Typography>
              <Typography variant="body1"><strong>Endereço:</strong> {storeData.address}</Typography>
              <Typography variant="body1"><strong>Telefone:</strong> {storeData.phone}</Typography>
              <Typography variant="body1"><strong>Status:</strong> {storeData.is_open ? 'Aberta' : 'Fechada'}</Typography>
              <Typography variant="body1"><strong>Horário de Funcionamento:</strong> {storeData.opening_hours}</Typography>
              <Typography variant="body1"><strong>Tempo Médio de Preparo:</strong> {storeData.avg_preparation_time_minutes} min</Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum dado da loja configurado ainda.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
            >
              Configurar Loja
            </Button>
          </Box>
        )
      )}

      <Dialog open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{storeData ? "Editar Configurações da Loja" : "Configurar Nova Loja"}</DialogTitle>
        <DialogContent dividers>
          <StoreForm
            initialData={storeData}
            onSubmit={handleSaveStore}
            onCancel={() => setIsFormModalOpen(false)}
            isSaving={loading}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminStoreManagementPage;
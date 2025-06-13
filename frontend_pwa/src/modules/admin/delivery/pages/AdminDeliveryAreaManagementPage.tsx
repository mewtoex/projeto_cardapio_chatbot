// frontend_pwa/src/modules/admin/delivery/pages/AdminDeliveryAreaManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import DeliveryAreaForm from '../components/DeliveryAreaForm'; 
import ConfirmationDialog from '../../../../components/UI/ConfirmationDialog'; 
import { type DeliveryArea } from '../../../../types';

const AdminDeliveryAreaManagementPage: React.FC = () => {
  const notification = useNotification();
  const { 
    data: deliveryAreas, 
    loading, 
    error, 
    execute: fetchDeliveryAreas,
    setData: setDeliveryAreasManually,
  } = useLoading<DeliveryArea[]>();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<DeliveryArea | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [areaToDeleteId, setAreaToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDeliveryAreas();
  }, []);

  const loadDeliveryAreas = async () => {
    await fetchDeliveryAreas(
      api.getDeliveryAreas(),
      undefined,
      "Erro ao carregar áreas de entrega."
    );
  };

  const handleAddArea = () => {
    setSelectedDeliveryArea(null);
    setIsFormModalOpen(true);
  };

  const handleEditArea = (area: DeliveryArea) => {
    setSelectedDeliveryArea(area);
    setIsFormModalOpen(true);
  };

  const handleDeleteArea = (id: string) => {
    setAreaToDeleteId(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (areaToDeleteId) {
      try {
        await api.deleteDeliveryArea(areaToDeleteId);
        notification.showSuccess("Área de entrega removida com sucesso!");
        setDeliveryAreasManually(prev => prev ? prev.filter(area => area.id.toString() !== areaToDeleteId) : []);
      } catch (err: any) {
        notification.showError(err.message || "Falha ao remover área de entrega.");
      } finally {
        setIsConfirmDeleteModalOpen(false);
        setAreaToDeleteId(null);
      }
    }
  };

  const handleSaveDeliveryArea = async (data: { district_name: string; delivery_fee: number }) => {
    try {
      let savedArea: DeliveryArea;
      if (selectedDeliveryArea) {
        savedArea = await api.updateDeliveryArea(selectedDeliveryArea.id.toString(), data);
        notification.showSuccess("Área de entrega atualizada com sucesso!");
        setDeliveryAreasManually(prev => prev ? prev.map(area => (area.id === savedArea.id ? savedArea : area)) : []);
      } else {
        savedArea = await api.createDeliveryArea(data);
        notification.showSuccess("Área de entrega adicionada com sucesso!");
        setDeliveryAreasManually(prev => prev ? [...prev, savedArea] : []);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar área de entrega.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Áreas de Entrega
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Defina as áreas onde seu restaurante faz entregas e suas respectivas taxas.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddArea}
        sx={{ mb: 3 }}
      >
        Adicionar Nova Área
      </Button>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (deliveryAreas?.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Nenhuma área de entrega cadastrada.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bairro</TableCell>
                <TableCell>Taxa de Entrega</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deliveryAreas?.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.district_name}</TableCell>
                  <TableCell>R$ {area.delivery_fee.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditArea(area)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteArea(area.id.toString())}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}

      <Dialog open={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedDeliveryArea ? "Editar Área de Entrega" : "Adicionar Nova Área de Entrega"}</DialogTitle>
        <DialogContent dividers>
          <DeliveryAreaForm
            initialData={selectedDeliveryArea}
            onSubmit={handleSaveDeliveryArea}
            onCancel={() => setIsFormModalOpen(false)}
            isSaving={loading}
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja remover esta área de entrega? Esta ação não pode ser desfeita."
        confirmButtonText="Remover"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default AdminDeliveryAreaManagementPage;
// src/modules/admin/delivery/pages/AdminDeliveryAreaManagementPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ApiService from '../../../shared/services/ApiService';
import { useNotification } from '../../../../contexts/NotificationContext';
import {type DeliveryArea } from '../../../../types'; // Importar DeliveryArea do novo caminho

interface DeliveryAreaFormData {
  district_name: string;
  delivery_fee: string; 
}

const AdminDeliveryAreaManagementPage: React.FC = () => {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentArea, setCurrentArea] = useState<DeliveryArea | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<DeliveryAreaFormData>({
    district_name: '',
    delivery_fee: '',
  });

  const notification = useNotification();

  const fetchDeliveryAreas = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDeliveryAreas();
      setDeliveryAreas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar áreas de entrega.');
      notification.showError('Erro ao carregar áreas de entrega.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryAreas();
  }, []);

  const handleOpenDialog = (area?: DeliveryArea) => {
    if (area) {
      setCurrentArea(area);
      setFormData({
        district_name: area.district_name,
        delivery_fee: area.delivery_fee.toFixed(2),
      });
    } else {
      setCurrentArea(null);
      setFormData({
        district_name: '',
        delivery_fee: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      if (!formData.district_name || formData.delivery_fee === '') {
        notification.showError('Nome do bairro e taxa de entrega são obrigatórios.');
        setIsSaving(false);
        return;
      }

      const fee = parseFloat(formData.delivery_fee);
      if (isNaN(fee) || fee < 0) {
        notification.showError('Taxa de entrega inválida. Deve ser um número não negativo.');
        setIsSaving(false);
        return;
      }

      if (currentArea) {
        await ApiService.updateDeliveryArea(currentArea.id, { district_name: formData.district_name, delivery_fee: fee });
        notification.showSuccess('Área de entrega atualizada com sucesso!');
      } else {
        await ApiService.createDeliveryArea({ district_name: formData.district_name, delivery_fee: fee });
        notification.showSuccess('Área de entrega adicionada com sucesso!');
      }
      fetchDeliveryAreas();
      handleCloseDialog();
    } catch (err) {
      notification.showError(err instanceof Error ? err.message : 'Erro ao salvar área de entrega.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta área de entrega?')) {
      try {
        await ApiService.deleteDeliveryArea(id);
        setDeliveryAreas(prev => prev.filter(area => area.id !== id));
        notification.showSuccess('Área de entrega excluída com sucesso!');
      } catch (err) {
        notification.showError(err instanceof Error ? err.message : 'Erro ao excluir área de entrega.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando áreas de entrega...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro: {error}
        </Alert>
        <Button variant="contained" onClick={fetchDeliveryAreas}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gerenciamento de Áreas de Entrega</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adicionar Nova Área
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Bairro</TableCell>
              <TableCell>Taxa de Entrega</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deliveryAreas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body1">Nenhuma área de entrega cadastrada.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              deliveryAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.id}</TableCell>
                  <TableCell>{area.district_name}</TableCell>
                  <TableCell>R$ {area.delivery_fee.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(area)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(area.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentArea ? 'Editar Área de Entrega' : 'Adicionar Nova Área de Entrega'}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Nome do Bairro"
            name="district_name"
            value={formData.district_name}
            onChange={handleInputChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Taxa de Entrega (R$)"
            name="delivery_fee"
            value={formData.delivery_fee}
            onChange={handleInputChange}
            margin="normal"
            type="number"
            inputProps={{ step: "0.01", min: "0" }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDeliveryAreaManagementPage;
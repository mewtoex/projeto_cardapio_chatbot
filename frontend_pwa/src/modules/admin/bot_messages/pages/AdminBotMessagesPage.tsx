// src/modules/admin/bot_messages/pages/AdminBotMessagesPage.tsx
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
  Switch,
  FormControlLabel,
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
// Removidas as interfaces locais e importado os tipos globais
import {type BotMessage, type BotMessageFormData } from '../../../../types/BotMessage'; // Ajustar conforme a estrutura BotMessage.ts



const AdminBotMessagesPage: React.FC = () => {
  const [botMessages, setBotMessages] = useState<BotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<BotMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<BotMessageFormData>({
    command: '',
    response_text: '',
    is_active: true,
  });

  const notification = useNotification();

  const fetchBotMessages = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAllBotMessagesAdmin();
      setBotMessages(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar mensagens do bot.');
      notification.showError('Erro ao carregar mensagens do bot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotMessages();
  }, []);

  const handleOpenDialog = (message?: BotMessage) => {
    if (message) {
      setCurrentMessage(message);
      setFormData({
        command: message.command,
        response_text: message.response_text,
        is_active: message.is_active,
      });
    } else {
      setCurrentMessage(null);
      setFormData({
        command: '',
        response_text: '',
        is_active: true,
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

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      is_active: e.target.checked
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      if (!formData.command || !formData.response_text) {
        notification.showError('Comando e texto de resposta são obrigatórios.');
        setIsSaving(false);
        return;
      }

      if (currentMessage) {
        await ApiService.updateBotMessage(currentMessage.id, formData);
        notification.showSuccess('Mensagem do bot atualizada com sucesso!');
      } else {
        await ApiService.createBotMessage(formData);
        notification.showSuccess('Mensagem do bot adicionada com sucesso!');
      }
      fetchBotMessages();
      handleCloseDialog();
    } catch (err) {
      notification.showError(err instanceof Error ? err.message : 'Erro ao salvar mensagem do bot.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta mensagem do bot?')) {
      try {
        await ApiService.deleteBotMessage(id);
        setBotMessages(prev => prev.filter(msg => msg.id !== id));
        notification.showSuccess('Mensagem do bot excluída com sucesso!');
      } catch (err) {
        notification.showError(err instanceof Error ? err.message : 'Erro ao excluir mensagem do bot.');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando mensagens...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro: {error}
        </Alert>
        <Button variant="contained" onClick={fetchBotMessages}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gerenciamento de Mensagens do Chatbot</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Adicionar Nova Mensagem
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Comando</TableCell>
              <TableCell>Texto de Resposta</TableCell>
              <TableCell>Ativa</TableCell>
              <TableCell>Última Atualização</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {botMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1">Nenhuma mensagem do bot cadastrada.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              botMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.id}</TableCell>
                  <TableCell>{message.command}</TableCell>
                  <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {message.response_text}
                  </TableCell>
                  <TableCell>
                    <Switch checked={message.is_active} disabled />
                  </TableCell>
                  <TableCell>{message.last_updated ? new Date(message.last_updated).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(message)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(message.id)}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {currentMessage ? 'Editar Mensagem do Bot' : 'Adicionar Nova Mensagem do Bot'}
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Comando (Identificador Único)"
            name="command"
            value={formData.command}
            onChange={handleInputChange}
            margin="normal"
            required
            disabled={!!currentMessage} 
            helperText={currentMessage ? "Comando não pode ser alterado" : "Ex: 'saudacao', 'cardapio_vazio'"}
          />
          <TextField
            fullWidth
            label="Texto de Resposta"
            name="response_text"
            value={formData.response_text}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={6}
            required
            helperText="Este é o texto que o bot enviará como resposta."
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={handleSwitchChange}
                color="primary"
              />
            }
            label="Mensagem Ativa"
            sx={{ mt: 2 }}
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

export default AdminBotMessagesPage;
// frontend_pwa/src/modules/admin/bot_messages/pages/AdminBotMessagesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import BotMessageForm from '../components/BotMessageForm'; // Novo componente de formulário
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'; // Novo componente de diálogo de confirmação
import { type BotMessage, type BotMessageFormData } from '../../../../types';

const AdminBotMessagesPage: React.FC = () => {
  const notification = useNotification();
  const { 
    data: botMessages, 
    loading, 
    error, 
    execute: fetchBotMessages,
    setData: setBotMessagesManually,
  } = useLoading<BotMessage[]>();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedBotMessage, setSelectedBotMessage] = useState<BotMessage | null>(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [botMessageToDelete, setBotMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadBotMessages();
  }, []);

  const loadBotMessages = async () => {
    await fetchBotMessages(
      api.getAllBotMessagesAdmin(),
      undefined, // Não mostra mensagem de sucesso genérica na carga inicial
      "Erro ao carregar mensagens do bot."
    );
  };

  const handleAddBotMessage = () => {
    setSelectedBotMessage(null);
    setIsFormModalOpen(true);
  };

  const handleEditBotMessage = (message: BotMessage) => {
    setSelectedBotMessage(message);
    setIsFormModalOpen(true);
  };

  const handleDeleteBotMessage = (id: string) => {
    setBotMessageToDelete(id);
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (botMessageToDelete) {
      try {
        await api.deleteBotMessage(botMessageToDelete);
        notification.showSuccess("Mensagem do bot removida com sucesso!");
        setBotMessagesManually(prev => prev ? prev.filter(msg => msg.id !== botMessageToDelete) : []);
      } catch (err: any) {
        notification.showError(err.message || "Falha ao remover mensagem do bot.");
      } finally {
        setIsConfirmDeleteModalOpen(false);
        setBotMessageToDelete(null);
      }
    }
  };

  const handleSaveBotMessage = async (formData: BotMessageFormData) => {
    try {
      if (selectedBotMessage) {
        // Edição
        const updatedMessage = await api.updateBotMessage(selectedBotMessage.id.toString(), formData);
        notification.showSuccess("Mensagem do bot atualizada com sucesso!");
        setBotMessagesManually(prev => prev ? prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg) : []);
      } else {
        // Criação
        const newMessage = await api.createBotMessage(formData);
        notification.showSuccess("Mensagem do bot adicionada com sucesso!");
        setBotMessagesManually(prev => prev ? [...prev, newMessage] : [newMessage]);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao salvar mensagem do bot.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciar Mensagens do Chatbot
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Aqui você pode adicionar, editar ou remover mensagens que o chatbot utiliza para interagir com os clientes.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddBotMessage}
        sx={{ mb: 3 }}
      >
        Adicionar Nova Mensagem
      </Button>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (botMessages?.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Nenhuma mensagem de bot cadastrada. Comece adicionando uma!
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Comando/Palavra-chave</TableCell>
                <TableCell>Resposta</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {botMessages?.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.command_keyword}</TableCell>
                  <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{message.response_text}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEditBotMessage(message)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteBotMessage(message.id.toString())}>
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
        <DialogTitle>{selectedBotMessage ? "Editar Mensagem do Bot" : "Adicionar Nova Mensagem do Bot"}</DialogTitle>
        <DialogContent dividers>
          <BotMessageForm
            initialData={selectedBotMessage}
            onSubmit={handleSaveBotMessage}
            onCancel={() => setIsFormModalOpen(false)}
            isSaving={loading} // Passa o estado de loading para o formulário
          />
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isConfirmDeleteModalOpen}
        onClose={() => setIsConfirmDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja remover esta mensagem do bot? Esta ação não pode ser desfeita."
        confirmButtonText="Remover"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default AdminBotMessagesPage;
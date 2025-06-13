import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid, CircularProgress,
  Dialog, DialogTitle, DialogContent, Tabs, Tab
} from '@mui/material';
import { AccountCircle as AccountCircleIcon, LocationOn as LocationOnIcon } from '@mui/icons-material';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import { useAddresses } from '../../../../hooks/useAddresses'; 
import api from '../../../../api/api';
import UserProfileForm from '../components/UserProfileForm'; 
import AddressForm from '../components/AddressForm'; 
import AddressList from '../components/AddressList';
import { type UserProfile, type Address } from '../../../../types';

const ClientProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const notification = useNotification();

  const {
    data: userProfile,
    loading: loadingProfile,
    error: profileError,
    execute: fetchUserProfile,
    setData: setUserProfileManually,
  } = useLoading<UserProfile>();

  const {
    addresses,
    loading: loadingAddresses,
    error: addressesError,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
  } = useAddresses(); 

  const [currentTab, setCurrentTab] = useState(0); 
  const [isProfileFormModalOpen, setIsProfileFormModalOpen] = useState(false);
  const [isAddressFormModalOpen, setIsAddressFormModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (isAuthenticated && !userProfile) {
      fetchUserProfile(api.getUserProfile(), undefined, "Erro ao carregar dados do perfil.");
    }
  }, [isAuthenticated, userProfile, fetchUserProfile]);


  const handleOpenProfileForm = () => {
    setIsProfileFormModalOpen(true);
  };

  const handleSaveProfile = async (data: Partial<UserProfile>) => {
    try {
      if (userProfile) {
        const updatedProfile = await api.updateUserProfile(data);
        notification.showSuccess("Perfil atualizado com sucesso!");
        setUserProfileManually(updatedProfile);
      }
      setIsProfileFormModalOpen(false);
    } catch (err: any) {
      notification.showError(err.message || "Falha ao atualizar perfil.");
    }
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressFormModalOpen(true);
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setIsAddressFormModalOpen(true);
  };

  const handleSaveAddress = async (data: Address) => {
    try {
      if (selectedAddress) {
        await updateAddress(selectedAddress.id.toString(), data);
      } else {
        await addAddress(data);
      }
      setIsAddressFormModalOpen(false);
    } catch (err) {
      console.error("Falha ao salvar endereço:", err);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddress(id);
    } catch (err) {
      console.error("Falha ao deletar endereço:", err);
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    try {
      await setPrimaryAddress(id);
    } catch (err) {
      console.error("Falha ao definir endereço principal:", err);
    }
  };

  const loading = loadingProfile || loadingAddresses;
  const error = profileError || addressesError;

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Carregando dados do perfil...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">Erro ao carregar dados:</Typography>
          <Typography>{error}</Typography>
          <Button onClick={() => { fetchUserProfile(api.getUserProfile(), undefined, "Erro ao recarregar perfil."); }} sx={{ mt: 2 }}>Tentar Novamente</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Meu Perfil
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_e, newValue) => setCurrentTab(newValue)} aria-label="Profile Tabs" centered>
          <Tab label="Dados Pessoais" icon={<AccountCircleIcon />} iconPosition="start" />
          <Tab label="Meus Endereços" icon={<LocationOnIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {currentTab === 0 && ( 
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Informações Pessoais
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenProfileForm}
            >
              Editar Perfil
            </Button>
          </Box>
          <Typography variant="body1"><strong>Nome:</strong> {userProfile?.name}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userProfile?.email}</Typography>
          <Typography variant="body1"><strong>Telefone:</strong> {userProfile?.phone}</Typography>
          <Typography variant="body1"><strong>Função:</strong> {userProfile?.role}</Typography>
        </Paper>
      )}

      {currentTab === 1 && ( 
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Meus Endereços
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAddress}
            >
              Adicionar Endereço
            </Button>
          </Box>
          <AddressList
            addresses={addresses || []}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
            onSetPrimary={handleSetPrimaryAddress}
          />
        </Paper>
      )}

      <Dialog open={isProfileFormModalOpen} onClose={() => setIsProfileFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent dividers>
          <UserProfileForm
            initialData={userProfile}
            onSubmit={handleSaveProfile}
            onCancel={() => setIsProfileFormModalOpen(false)}
            isSaving={loadingProfile}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddressFormModalOpen} onClose={() => setIsAddressFormModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedAddress ? "Editar Endereço" : "Adicionar Novo Endereço"}</DialogTitle>
        <DialogContent dividers>
          <AddressForm
            initialData={selectedAddress}
            onSubmit={handleSaveAddress}
            onCancel={() => setIsAddressFormModalOpen(false)}
            isSaving={loadingAddresses}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ClientProfilePage;
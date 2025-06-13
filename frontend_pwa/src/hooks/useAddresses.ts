// frontend_pwa/src/hooks/useAddresses.ts
import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { type Address } from '../types';
import { useLoading } from './useLoading'; // Reutiliza o useLoading
import { useNotification } from '../contexts/NotificationContext';

export function useAddresses() {
  const { 
    data: addresses, 
    loading, 
    error, 
    execute: fetchAddresses, 
    setData: setAddressesManually 
  } = useLoading<Address[]>();
  const notification = useNotification();

  useEffect(() => {
    fetchAddresses(api.getUserAddresses(), undefined, "Erro ao carregar endereços.");
  }, [fetchAddresses]);

  const addAddress = useCallback(async (newAddress: Address) => {
    try {
      const addedAddress = await fetchAddresses(
        api.addUserAddress(newAddress),
        "Endereço adicionado com sucesso!",
        "Erro ao adicionar endereço."
      );
      if (addedAddress && addresses) {
        setAddressesManually([...addresses, addedAddress]);
      } else if (addedAddress) {
        setAddressesManually([addedAddress]); // Se addresses ainda for null/undefined
      }
      return addedAddress;
    } catch (e) {
      console.error('Falha ao adicionar endereço:', e);
      throw e; // Propaga o erro para o componente se precisar de tratamento específico
    }
  }, [fetchAddresses, addresses, setAddressesManually]);

  const updateAddress = useCallback(async (id: string, updatedData: Partial<Address>) => {
    try {
      const response = await fetchAddresses(
        api.updateUserAddress(id, updatedData),
        "Endereço atualizado com sucesso!",
        "Erro ao atualizar endereço."
      );
      if (response && addresses) {
        setAddressesManually(addresses.map(addr => (addr.id === id ? response : addr)));
      }
      return response;
    } catch (e) {
      console.error('Falha ao atualizar endereço:', e);
      throw e;
    }
  }, [fetchAddresses, addresses, setAddressesManually]);

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await fetchAddresses(
        api.deleteUserAddress(id),
        "Endereço removido com sucesso!",
        "Erro ao remover endereço."
      );
      if (addresses) {
        setAddressesManually(addresses.filter(addr => addr.id !== id));
      }
    } catch (e) {
      console.error('Falha ao remover endereço:', e);
      throw e;
    }
  }, [fetchAddresses, addresses, setAddressesManually]);

  const setPrimaryAddress = useCallback(async (id: string) => {
    try {
      const response = await fetchAddresses(
        api.setPrimaryAddress(id),
        "Endereço principal definido com sucesso!",
        "Erro ao definir endereço principal."
      );
      if (response && addresses) {
        setAddressesManually(addresses.map(addr => ({
          ...addr,
          is_primary: addr.id === response.id, // Atualiza o status de primary
        })));
      }
      return response;
    } catch (e) {
      console.error('Falha ao definir endereço principal:', e);
      throw e;
    }
  }, [fetchAddresses, addresses, setAddressesManually]);

  // Retorna o primeiro endereço marcado como principal, ou null se não houver
  const getPrimaryAddress = useCallback(() => {
    return addresses?.find(addr => addr.is_primary) || null;
  }, [addresses]);

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
    getPrimaryAddress,
    // Permite recarregar os endereços manualmente se necessário
    refetchAddresses: () => fetchAddresses(api.getUserAddresses(), undefined, "Erro ao recarregar endereços."),
  };
}
// frontend_pwa/src/hooks/useLoading.ts
import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

interface UseLoadingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (promise: Promise<T>, successMessage?: string, errorMessage?: string) => Promise<T | null>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>; // Permite setar dados manualmente
}

export function useLoading<T = any>(): UseLoadingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification(); // Usando o contexto de notificação

  const execute = useCallback(async (promise: Promise<T>, successMessage?: string, errorMessage?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await promise;
      setData(result);
      if (successMessage) {
        showSuccess(successMessage);
      }
      return result;
    } catch (err: any) {
      const message = errorMessage || err.message || 'Ocorreu um erro inesperado.';
      setError(message);
      showError(message); // Exibe a notificação de erro
      // Rejeita a promise para que o chamador ainda possa tratar o erro se quiser
      throw err; 
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]); // Dependências do useCallback

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset, setData };
}
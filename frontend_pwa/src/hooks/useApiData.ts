import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext'; 

interface UseApiDataOptions {
  initialData?: any;
  fetchOnMount?: boolean;
  errorMessage?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

const useApiData = <T>(
  fetchFunction: (...args: any[]) => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiDataOptions = {}
) => {
  const { initialData = null, fetchOnMount = true, errorMessage = 'Falha ao carregar dados.', onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  const fetchData = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFunction(...args);
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err)) || errorMessage;
      setError(msg);
      notification.showError(msg);
      if (onError) onError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, errorMessage, notification, onSuccess, onError]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData, setData }; // setData permite atualizações externas
};

export default useApiData;
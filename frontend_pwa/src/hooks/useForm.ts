import { useState, useCallback } from 'react';

const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; 
    if (name) {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  }, []);

  const resetForm = useCallback(() => setFormData(initialState), [initialState]);
  const setForm = useCallback((newState: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...newState }));
  }, []);

  return { formData, setFormData, handleInputChange, resetForm, setForm };
};

export default useForm;
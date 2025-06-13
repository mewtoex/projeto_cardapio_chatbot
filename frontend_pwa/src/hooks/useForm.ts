// frontend_pwa/src/hooks/useForm.ts
import { useState, useCallback, type ChangeEvent } from 'react';

type FormValues = {
  [key: string]: any;
};

type FormErrors = {
  [key: string]: string;
};

// Tipo para a função de validação. Recebe os valores atuais do formulário e retorna um objeto de erros.
type Validator<T> = (values: T) => FormErrors;

export function useForm<T extends FormValues>(initialValues: T, validator?: Validator<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Indica se o formulário foi alterado

  // Lida com mudanças de inputs padrão (input, textarea, select)
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setValues(prevValues => {
      const newValues = {
        ...prevValues,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Opcional: Se desejar validação imediata ao digitar/alterar
      // if (validator) {
      //   const newErrors = validator(newValues);
      //   setErrors(prevErrors => ({ ...prevErrors, [name]: newErrors[name] }));
      // }
      return newValues;
    });
    setIsDirty(true);
  }, []);

  // Lida com mudanças de componentes personalizados ou valores que não vêm de eventos de input
  const handleManualChange = useCallback((name: string, value: any) => {
    setValues(prevValues => {
      const newValues = { ...prevValues, [name]: value };
      // Opcional: Se desejar validação imediata ao digitar/alterar
      // if (validator) {
      //   const newErrors = validator(newValues);
      //   setErrors(prevErrors => ({ ...prevErrors, [name]: newErrors[name] }));
      // }
      return newValues;
    });
    setIsDirty(true);
  }, []);

  // Função de submissão do formulário
  const handleSubmit = useCallback(async (callback: (values: T) => Promise<void>) => {
    setIsSubmitting(true);
    let formErrors: FormErrors = {};

    // Executa a validação se um validador foi fornecido
    if (validator) {
      formErrors = validator(values);
      setErrors(formErrors);
      if (Object.keys(formErrors).length > 0) {
        setIsSubmitting(false);
        return; // Impede a submissão se houver erros de validação
      }
    }

    try {
      await callback(values); // Executa a lógica de submissão do componente
      setIsDirty(false); // Resetar isDirty após submissão bem-sucedida
      setErrors({}); // Limpa os erros após sucesso
    } catch (err: any) {
      // O erro já deve ter sido tratado por useLoading ou api.ts, mas pode ser capturado aqui se necessário
      console.error("Erro na submissão do formulário:", err.message);
      // Aqui você poderia setar erros de volta para o formulário se a API retornar erros de validação específicos
      // setErrors(apiErrors); 
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validator]); // Dependências do useCallback

  // Reinicia o formulário para seus valores iniciais
  const resetForm = useCallback((newInitialValues?: T) => {
    setValues(newInitialValues || initialValues);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
  }, [initialValues]);

  // Permite definir todos os valores do formulário de uma vez (útil para edição)
  const setAllValues = useCallback((newValues: T) => {
    setValues(newValues);
    setErrors({}); // Limpa erros ao carregar novos valores
    setIsDirty(false); // Considera que o formulário está limpo ao ser preenchido por valores externos
  }, []);

  return {
    values,
    errors,
    handleChange,
    handleManualChange,
    handleSubmit,
    isSubmitting,
    isDirty,
    resetForm,
    setAllValues,
    setErrors, // Útil se você precisar setar erros de validação que vêm da API
  };
}
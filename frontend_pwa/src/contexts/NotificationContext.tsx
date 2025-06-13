import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const handleClose = useCallback((_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }, []);

  const showNotification = useCallback((msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  }, []);

  const showSuccess = useCallback((msg: string) => showNotification(msg, 'success'), [showNotification]);
  const showError = useCallback((msg: string) => showNotification(msg, 'error'), [showNotification]);
  const showWarning = useCallback((msg: string) => showNotification(msg, 'warning'), [showNotification]);
  const showInfo = useCallback((msg: string) => showNotification(msg, 'info'), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
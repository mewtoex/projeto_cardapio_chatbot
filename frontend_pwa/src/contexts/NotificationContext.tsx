// src/contexts/NotificationContext.tsx
import React, { createContext, useContext } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';

interface NotificationContextProps {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  const showSuccess = (message: string) => {
    enqueueSnackbar(message, { variant: 'success' });
  };

  const showError = (message: string) => {
    enqueueSnackbar(message, { variant: 'error' });
  };

  const showInfo = (message: string) => {
    enqueueSnackbar(message, { variant: 'info' });
  };

  const showWarning = (message: string) => {
    enqueueSnackbar(message, { variant: 'warning' });
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>
      {children}
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

export const AppNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
    >
      <NotificationProvider>{children}</NotificationProvider>
    </SnackbarProvider>
  );
};

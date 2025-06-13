// frontend_pwa/src/hooks/useAuth.ts
// Este arquivo pode conter o AuthContext e o hook, ou apenas o hook que consome o contexto.
// Para refatoração, vamos assumir que o AuthContext já existe e este hook o encapsula.

import { useContext } from 'react';
import { AuthContext } from '../modules/auth/contexts/AuthContext'; // Ajuste o caminho se necessário

// Este hook é uma forma mais limpa de acessar o AuthContext
// Ele garante que o contexto seja usado dentro de um AuthProvider
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// O conteúdo de src/modules/auth/contexts/AuthContext.tsx será ajustado para exportar o contexto
// e possivelmente os métodos auxiliares, ou apenas o provedor e o valor.
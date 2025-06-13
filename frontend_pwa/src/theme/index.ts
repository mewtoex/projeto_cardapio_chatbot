// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5722', // Cor laranja para contexto de alimentos
      light: '#FF8A65',
      dark: '#E64A19',
    },
    secondary: {
      main: '#2196F3', // Azul para ações secundárias
      light: '#64B5F6',
      dark: '#1976D2',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none', // Evitar texto em maiúsculas nos botões
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});
// frontend_pwa/src/theme/index.ts
import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Crie um tema Material-UI personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5722', // Laranja vibrante para primário (ex: botões de ação)
      light: '#FF8A50',
      dark: '#C41C00',
      contrastText: '#fff',
    },
    secondary: {
      main: '#4CAF50', // Verde para secundário (ex: sucesso, carrinho)
      light: '#80E27E',
      dark: '#087F23',
      contrastText: '#fff',
    },
    error: {
      main: red.A400, // Vermelho para erros
    },
    background: {
      default: '#f5f5f5', // Um cinza claro para o fundo geral
      paper: '#ffffff',   // Branco para componentes como Card, Paper
    },
    text: {
      primary: '#212121', // Cor do texto principal
      secondary: '#757575', // Cor do texto secundário/auxiliar
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Botões com texto normal, não em maiúsculas
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Borda arredondada para botões
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Borda arredondada para cartões
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Sombra suave
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Borda arredondada para papers
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Texto das abas em caso normal
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
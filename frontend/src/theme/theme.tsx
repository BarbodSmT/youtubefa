import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { faIR } from '@mui/material/locale';
import { iransans } from '../app/fonts';
const baseTheme: ThemeOptions = {
  direction: 'rtl',
  typography: {
    fontFamily: `var(${iransans.variable})`,
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'inherit',
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
};

export const lightTheme = createTheme(
  {
    ...baseTheme,
    palette: {
      mode: 'light',
      primary: {
        main: '#5f66a6',
        light: '#9ea4ca',
        dark: '#3f458f',
      },
      secondary: {
        main: '#43a6f5',
        light: '#90caf9',
        dark: '#1f89e5',
      },
      background: {
        default: '#d5dce4',
        paper: '#ffffff',
      },
      text: {
        primary: '#1a202c',
        secondary: '#4a5568',
      },
      divider: '#d9dde4',
      action: {
        hover: 'rgba(95, 102, 166, 0.2)',
      },
    },
  },
  faIR
);

export const darkTheme = createTheme(
  {
    ...baseTheme,
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
        light: '#bbdefb',
        dark: '#2296f3',
      },
      secondary: {
        main: '#1f89e5',
        light: '#65b6f6',
        dark: '#0d47a1',
      },
      background: {
        default: '#0f172a',
        paper: '#1e293b',
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
      },
      divider: '#334155',
      action: {
        hover: 'rgba(144, 202, 249, 0.2)',
      },
    },
  },
  faIR
);
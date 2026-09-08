import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1447e6', dark: '#0d2f9e', light: '#5c7cff' },
    secondary: { main: '#00b894' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    error: { main: '#e53935' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['"Inter"', 'Roboto', 'Arial', 'sans-serif'].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 12px rgba(20,71,230,0.08)' } } },
  },
});

export default theme;

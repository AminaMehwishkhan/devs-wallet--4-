import { Box, Paper, Typography, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1447e6 0%, #0d2f9e 100%)',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
          <AccountBalanceWalletIcon sx={{ color: '#fff', fontSize: 34 }} />
          <Typography variant="h5" fontWeight={800} color="#fff">Devs Wallet</Typography>
        </Box>
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}

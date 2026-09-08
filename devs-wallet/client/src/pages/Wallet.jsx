import { useEffect, useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, Tabs, Tab,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { getWallet, deposit, withdraw, transfer } from '../services/walletService';

const initialTx = { amount: '', description: '', recipientEmail: '' };

export default function WalletPage() {
  const [wallet, setWalletState] = useState(null);
  const [dialog, setDialog] = useState(null); // 'deposit' | 'withdraw' | 'transfer'
  const [form, setForm] = useState(initialTx);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadWallet = () => getWallet().then((res) => setWalletState(res.data)).catch((err) => {
    setLoadError(err.response?.data?.message || 'Failed to load wallet');
  });

  useEffect(() => { loadWallet(); }, []);

  const openDialog = (type) => { setDialog(type); setForm(initialTx); setError(''); };
  const closeDialog = () => setDialog(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (dialog === 'deposit') await deposit({ amount: form.amount, description: form.description });
      if (dialog === 'withdraw') await withdraw({ amount: form.amount, description: form.description });
      if (dialog === 'transfer') await transfer({ amount: form.amount, description: form.description, recipientEmail: form.recipientEmail });
      setSuccess(`${dialog} successful`);
      closeDialog();
      loadWallet();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>My Wallet</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1447e6 0%, #0d2f9e 100%)', color: '#fff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccountBalanceWalletIcon />
            <Typography variant="body2">Available Balance</Typography>
          </Box>
          <Typography variant="h3" fontWeight={800}>
            {wallet ? `Rs ${Number(wallet.balance).toLocaleString()}` : '...'}
          </Typography>
          <Typography variant="caption">{wallet?.currency}</Typography>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="contained" size="large" onClick={() => openDialog('deposit')}>Deposit</Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="outlined" size="large" onClick={() => openDialog('withdraw')}>Withdraw</Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button fullWidth variant="outlined" color="secondary" size="large" onClick={() => openDialog('transfer')}>Transfer</Button>
        </Grid>
      </Grid>

      <Dialog open={!!dialog} onClose={closeDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle sx={{ textTransform: 'capitalize' }}>{dialog}</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {dialog === 'transfer' && (
              <TextField
                fullWidth label="Recipient Email" type="email" margin="normal" required
                value={form.recipientEmail} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
              />
            )}
            <TextField
              fullWidth label="Amount (Rs)" type="number" margin="normal" required
              value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <TextField
              fullWidth label="Description (optional)" margin="normal"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Processing...' : 'Confirm'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

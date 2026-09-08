import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, TextField, MenuItem, Button, Alert,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import { getBills, payBill } from '../services/billService';

const CATEGORIES = [
  { value: 'electricity', label: 'Electricity', providers: ['LESCO', 'K-Electric', 'FESCO', 'MEPCO'] },
  { value: 'gas', label: 'Gas', providers: ['SNGPL', 'SSGC'] },
  { value: 'internet', label: 'Internet', providers: ['PTCL', 'StormFiber', 'Nayatel'] },
  { value: 'mobile', label: 'Mobile Postpaid', providers: ['Jazz', 'Zong', 'Ufone', 'Telenor'] },
];

export default function BillPayments() {
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [form, setForm] = useState({ category: '', provider: '', accountNumber: '', amount: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    setBillsLoading(true);
    setListError('');
    return getBills()
      .then((res) => setBills(res.data))
      .catch((err) => setListError(err.response?.data?.message || 'Failed to load payment history'))
      .finally(() => setBillsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const providers = CATEGORIES.find((c) => c.value === form.category)?.providers || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await payBill(form);
      setSuccess('Bill paid successfully!');
      setForm({ category: '', provider: '', accountNumber: '', amount: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Bill Payments</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BoltIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>Pay a Bill</Typography>
              </Box>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth select label="Category" margin="normal" required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value, provider: '' })}
                >
                  {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </TextField>
                <TextField
                  fullWidth select label="Provider" margin="normal" required disabled={!form.category}
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                >
                  {providers.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <TextField
                  fullWidth label="Account / Consumer Number" margin="normal" required
                  value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                />
                <TextField
                  fullWidth label="Amount (Rs)" type="number" margin="normal" required
                  value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay Bill'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Payment History</Typography>
              {listError && <Alert severity="error" sx={{ mb: 2 }}>{listError}</Alert>}
              {billsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
              ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Account #</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{b.category}</TableCell>
                      <TableCell>{b.provider}</TableCell>
                      <TableCell>{b.account_number}</TableCell>
                      <TableCell align="right">Rs {Number(b.amount).toLocaleString()}</TableCell>
                      <TableCell><Chip size="small" label={b.status} color={b.status === 'paid' ? 'success' : 'error'} /></TableCell>
                    </TableRow>
                  ))}
                  {bills.length === 0 && <TableRow><TableCell colSpan={5} align="center">No bills paid yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

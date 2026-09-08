import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress,
} from '@mui/material';
import SimCardIcon from '@mui/icons-material/SimCard';
import { getPackages, purchasePackage } from '../services/packageService';

export default function MobilePackages() {
  const [packages, setPackages] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPackages()
      .then((res) => setPackages(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load mobile packages'))
      .finally(() => setPageLoading(false));
  }, []);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await purchasePackage({ packageId: selected.id, mobileNumber });
      setSuccess(`${selected.name} activated successfully!`);
      setSelected(null);
      setMobileNumber('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Mobile Packages</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}
      {pageLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
      <Grid container spacing={2.5}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <SimCardIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>{pkg.name}</Typography>
                  </Box>
                  <Chip size="small" label={pkg.network} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>{pkg.description}</Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>Rs {Number(pkg.price).toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Valid for {pkg.validity_days} days</Typography>
                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={() => setSelected(pkg)}>Buy Now</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handlePurchase}>
          <DialogTitle>Buy {selected?.name}</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
              fullWidth label="Mobile Number" margin="normal" required autoFocus
              placeholder="03xxxxxxxxx"
              value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
            />
            <Typography variant="body2" color="text.secondary">
              You will be charged Rs {Number(selected?.price || 0).toLocaleString()}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setSelected(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Processing...' : 'Confirm Purchase'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

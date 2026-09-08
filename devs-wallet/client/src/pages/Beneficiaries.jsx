import { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, IconButton, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import { getBeneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary } from '../services/beneficiaryService';

const emptyForm = { nickname: '', beneficiaryEmail: '', bankOrWallet: '' };

export default function Beneficiaries() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // beneficiary being edited, or null when adding
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError('');
    return getBeneficiaries()
      .then((res) => setList(res.data))
      .catch((err) => setLoadError(err.response?.data?.message || 'Failed to load beneficiaries'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAddDialog = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEditDialog = (beneficiary) => {
    setEditing(beneficiary);
    setForm({
      nickname: beneficiary.nickname,
      beneficiaryEmail: beneficiary.beneficiary_email,
      bankOrWallet: beneficiary.bank_or_wallet || '',
    });
    setError('');
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        // Email is not editable once a beneficiary exists, matching the backend's update contract.
        await updateBeneficiary(editing.id, { nickname: form.nickname, bankOrWallet: form.bankOrWallet });
      } else {
        await addBeneficiary(form);
      }
      closeDialog();
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${editing ? 'update' : 'add'} beneficiary`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBeneficiary(id);
      await load();
    } catch (err) {
      setLoadError(err.response?.data?.message || 'Failed to remove beneficiary');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700}>Beneficiaries</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>Add Beneficiary</Button>
      </Box>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {list.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Card>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{b.nickname[0].toUpperCase()}</Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>{b.nickname}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{b.beneficiary_email}</Typography>
                    <Typography variant="caption" color="text.secondary">{b.bank_or_wallet}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => openEditDialog(b)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(b.id)}><DeleteIcon fontSize="small" /></IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {list.length === 0 && !loadError && (
            <Grid item xs={12}><Typography color="text.secondary">No beneficiaries added yet.</Typography></Grid>
          )}
        </Grid>
      )}

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{editing ? 'Edit Beneficiary' : 'Add Beneficiary'}</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField fullWidth label="Nickname" margin="normal" required
              value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
            <TextField
              fullWidth label="Devs Wallet Email" type="email" margin="normal" required
              disabled={!!editing}
              helperText={editing ? "Email can't be changed after a beneficiary is added" : ''}
              value={form.beneficiaryEmail} onChange={(e) => setForm({ ...form, beneficiaryEmail: e.target.value })}
            />
            <TextField fullWidth label="Bank / Wallet (optional)" margin="normal"
              value={form.bankOrWallet} onChange={(e) => setForm({ ...form, bankOrWallet: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

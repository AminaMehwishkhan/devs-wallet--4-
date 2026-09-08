import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Link as MLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register as registerApi } from '../services/authService';
import { setCredentials } from '../redux/authSlice';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerApi(form);
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>Create your account</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>It only takes a minute</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField fullWidth label="Full Name" margin="normal" required
        value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      <TextField fullWidth label="Email" type="email" margin="normal" required
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <TextField fullWidth label="Phone" margin="normal"
        value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <TextField fullWidth label="Password" type="password" margin="normal" required
        helperText="At least 6 characters"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2, py: 1.2 }} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        Already have an account? <MLink component={Link} to="/login">Sign in</MLink>
      </Typography>
    </Box>
  );
}

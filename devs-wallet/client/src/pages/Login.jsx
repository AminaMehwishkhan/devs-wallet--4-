import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Link as MLink } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login as loginApi } from '../services/authService';
import { setCredentials } from '../redux/authSlice';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginApi(form);
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>Welcome back</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Login to your Devs Wallet account</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        fullWidth label="Email" type="email" margin="normal" required
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <TextField
        fullWidth label="Password" type="password" margin="normal" required
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <Box sx={{ textAlign: 'right', mt: 0.5 }}>
        <MLink component={Link} to="/forgot-password" variant="body2">Forgot password?</MLink>
      </Box>
      <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2, py: 1.2 }} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        Don't have an account? <MLink component={Link} to="/register">Sign up</MLink>
      </Typography>
    </Box>
  );
}

import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Link as MLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      if (res.data?.resetToken) setToken(res.data.resetToken); // demo mode convenience
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      const res = await resetPassword({ token, newPassword });
      setMessage(res.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>Reset your password</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {step === 1 ? "We'll generate a reset token for your account" : 'Enter the token and your new password'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {step === 1 ? (
        <Box component="form" onSubmit={requestReset}>
          <TextField fullWidth label="Email" type="email" margin="normal" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2, py: 1.2 }} disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Token'}
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={submitReset}>
          <TextField fullWidth label="Reset Token" margin="normal" required
            value={token} onChange={(e) => setToken(e.target.value)} />
          <TextField fullWidth label="New Password" type="password" margin="normal" required
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2, py: 1.2 }} disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </Box>
      )}
      <Typography variant="body2" align="center" sx={{ mt: 3 }}>
        <MLink component={Link} to="/login">Back to login</MLink>
      </Typography>
    </Box>
  );
}

import { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, TextField, Button, Alert, Avatar, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useDispatch } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { updateProfile, changePassword, uploadAvatar } from '../services/profileService';
import { updateUser } from '../redux/authSlice';

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  const [profileForm, setProfileForm] = useState({ fullName: user?.full_name || '', phone: user?.phone || '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileErr(''); setProfileMsg('');
    try {
      const res = await updateProfile(profileForm);
      dispatch(updateUser(res.data));
      setProfileMsg('Profile updated successfully');
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwErr(''); setPwMsg('');
    try {
      await changePassword(pwForm);
      setPwMsg('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Change failed');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await uploadAvatar(formData);
    dispatch(updateUser(res.data));
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Profile & Security</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar src={user?.avatar_url} sx={{ width: 72, height: 72 }}>{user?.full_name?.[0]}</Avatar>
                  <IconButton
                    component="label"
                    size="small"
                    sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}
                  >
                    <PhotoCameraIcon fontSize="small" />
                    <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                  </IconButton>
                </Box>
                <Box>
                  <Typography fontWeight={700}>{user?.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight={700} mb={1}>Personal Information</Typography>
              {profileErr && <Alert severity="error" sx={{ mb: 2 }}>{profileErr}</Alert>}
              {profileMsg && <Alert severity="success" sx={{ mb: 2 }}>{profileMsg}</Alert>}
              <Box component="form" onSubmit={handleProfileSubmit}>
                <TextField fullWidth label="Full Name" margin="normal"
                  value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                <TextField fullWidth label="Phone" margin="normal"
                  value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>Save Changes</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Change Password</Typography>
              {pwErr && <Alert severity="error" sx={{ mb: 2 }}>{pwErr}</Alert>}
              {pwMsg && <Alert severity="success" sx={{ mb: 2 }}>{pwMsg}</Alert>}
              <Box component="form" onSubmit={handlePasswordSubmit}>
                <TextField fullWidth label="Current Password" type="password" margin="normal" required
                  value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                <TextField fullWidth label="New Password" type="password" margin="normal" required
                  value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                <Button type="submit" variant="contained" sx={{ mt: 1 }}>Update Password</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

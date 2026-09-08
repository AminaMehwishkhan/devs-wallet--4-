import { AppBar, Toolbar, Box, Avatar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../redux/authSlice';
import { DRAWER_WIDTH } from './Sidebar';

export default function Navbar({ onMenuClick = () => {} }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #eef0f4',
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { sm: 'none' } }}
          aria-label="open navigation menu"
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.full_name}
          </Typography>
          <Avatar src={user?.avatar_url} sx={{ width: 36, height: 36 }}>
            {user?.full_name?.[0]?.toUpperCase()}
          </Avatar>
        </Box>
        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>My Profile</MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

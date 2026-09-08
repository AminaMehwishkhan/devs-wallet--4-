import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar, { DRAWER_WIDTH } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleDrawerClose = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerClose} />
      <Navbar onMenuClick={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minWidth: 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

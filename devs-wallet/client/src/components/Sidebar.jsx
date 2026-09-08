import { List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Box, Typography, Drawer } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import SavingsIcon from '@mui/icons-material/SavingsOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import SimCardIcon from '@mui/icons-material/SimCardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useAuth } from '../hooks/useAuth';

export const DRAWER_WIDTH = 240;

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/wallet', label: 'Wallet', icon: <AccountBalanceWalletIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <ReceiptLongIcon /> },
  { to: '/savings-goals', label: 'Savings Goals', icon: <SavingsIcon /> },
  { to: '/bills', label: 'Bill Payments', icon: <BoltIcon /> },
  { to: '/packages', label: 'Mobile Packages', icon: <SimCardIcon /> },
  { to: '/beneficiaries', label: 'Beneficiaries', icon: <PeopleIcon /> },
  { to: '/profile', label: 'Profile & Security', icon: <PersonIcon /> },
];

const adminLinks = [
  { to: '/admin/users', label: 'Manage Users', icon: <PeopleIcon /> },
  { to: '/admin/transactions', label: 'All Transactions', icon: <ReceiptLongIcon /> },
  { to: '/admin/reports', label: 'Reports', icon: <AdminPanelSettingsIcon /> },
];

function SidebarContent({ isAdmin, location, onNavigate }) {
  return (
    <>
      <Toolbar>
        <Typography variant="h6" color="primary" fontWeight={800}>Devs Wallet</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {userLinks.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            selected={location.pathname === item.to}
            onClick={onNavigate}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      {isAdmin && (
        <>
          <Divider sx={{ mx: 2 }} />
          <Box sx={{ px: 3, pt: 1.5, pb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>ADMIN PANEL</Typography>
          </Box>
          <List sx={{ px: 1 }}>
            {adminLinks.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={location.pathname === item.to}
                onClick={onNavigate}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </>
  );
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { isAdmin } = useAuth();
  const location = useLocation();

  return (
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      {/* Mobile: temporary drawer that overlays content and closes on navigation/backdrop click */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent isAdmin={isAdmin} location={location} onNavigate={onClose} />
      </Drawer>

      {/* Desktop/tablet: permanent drawer always visible */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #eef0f4' },
        }}
        open
      >
        <SidebarContent isAdmin={isAdmin} location={location} onNavigate={() => {}} />
      </Drawer>
    </Box>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Transactions from './pages/Transactions';
import SavingsGoals from './pages/SavingsGoals';
import BillPayments from './pages/BillPayments';
import MobilePackages from './pages/MobilePackages';
import Beneficiaries from './pages/Beneficiaries';
import Profile from './pages/Profile';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminReports from './pages/admin/AdminReports';

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/bills" element={<BillPayments />} />
          <Route path="/packages" element={<MobilePackages />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

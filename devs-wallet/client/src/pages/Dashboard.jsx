import { useEffect, useState } from 'react';
import { Grid, Typography, Card, CardContent, Box, Chip, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';

const COLORS = ['#1447e6', '#00b894', '#f39c12', '#e53935', '#8e44ad', '#16a085'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error || !stats) {
    return <Alert severity="error">{error || 'Failed to load dashboard data'}</Alert>;
  }

  const inflow = stats.breakdown.filter((b) => ['deposit', 'transfer_in'].includes(b.type))
    .reduce((s, b) => s + Number(b.total), 0);
  const outflow = stats.breakdown.filter((b) => !['deposit', 'transfer_in'].includes(b.type))
    .reduce((s, b) => s + Number(b.total), 0);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Welcome back, {user?.full_name?.split(' ')[0]} 👋</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Here's what's happening with your wallet today.</Typography>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Current Balance" value={`Rs ${Number(stats.balance).toLocaleString()}`} icon={<AccountBalanceWalletIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Inflow" value={`Rs ${inflow.toLocaleString()}`} icon={<ArrowDownwardIcon />} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Outflow" value={`Rs ${outflow.toLocaleString()}`} icon={<ArrowUpwardIcon />} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Transactions" value={stats.breakdown.reduce((s, b) => s + Number(b.total > 0 ? 1 : 0), 0) || stats.recentTransactions.length} icon={<ReceiptLongIcon />} color="#f39c12" />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Cash Flow (Last 6 Months)</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="inflow" stroke="#00b894" strokeWidth={2.5} name="Inflow" />
                  <Line type="monotone" dataKey="outflow" stroke="#e53935" strokeWidth={2.5} name="Outflow" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Spending Breakdown</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.breakdown} dataKey="total" nameKey="type" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {stats.breakdown.map((entry, index) => (
                      <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Recent Transactions</Typography>
              {stats.recentTransactions.length === 0 && (
                <Typography variant="body2" color="text.secondary">No transactions yet.</Typography>
              )}
              {stats.recentTransactions.map((tx) => (
                <Box key={tx.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid #f0f0f0' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{tx.description}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(tx.created_at).toLocaleString()}</Typography>
                  </Box>
                  <Chip
                    label={`${['deposit', 'transfer_in'].includes(tx.type) ? '+' : '-'} Rs ${Number(tx.amount).toLocaleString()}`}
                    color={['deposit', 'transfer_in'].includes(tx.type) ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

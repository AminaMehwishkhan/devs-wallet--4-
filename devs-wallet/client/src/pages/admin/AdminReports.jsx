import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import StatCard from '../../components/StatCard';
import PeopleIcon from '@mui/icons-material/PeopleAltOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import { getReports } from '../../services/adminService';

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getReports()
      .then((res) => setReport(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  if (error || !report) {
    return <Alert severity="error">{error || 'Failed to load reports'}</Alert>;
  }

  const { totals } = report;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Reports & Analytics</Typography>
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Users" value={totals.total_users} icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Users" value={totals.active_users} icon={<PeopleIcon />} color="secondary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Wallet Balance" value={`Rs ${Number(totals.total_wallet_balance).toLocaleString()}`} icon={<AccountBalanceWalletIcon />} color="#f39c12" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Transactions" value={totals.total_transactions} icon={<ReceiptLongIcon />} color="error.main" />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Monthly Transaction Volume</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={report.monthlyTransactionVolume}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#1447e6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>New Users Per Month</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={report.newUsersPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="new_users" stroke="#00b894" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Revenue Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><StatCard title="Deposits" value={`Rs ${Number(totals.total_deposits).toLocaleString()}`} icon={<AccountBalanceWalletIcon />} /></Grid>
                <Grid item xs={6} sm={3}><StatCard title="Withdrawals" value={`Rs ${Number(totals.total_withdrawals).toLocaleString()}`} icon={<AccountBalanceWalletIcon />} color="error.main" /></Grid>
                <Grid item xs={6} sm={3}><StatCard title="Bill Payments" value={`Rs ${Number(totals.total_bill_payments).toLocaleString()}`} icon={<BoltIcon />} color="#f39c12" /></Grid>
                <Grid item xs={6} sm={3}><StatCard title="Package Sales" value={`Rs ${Number(totals.total_package_sales).toLocaleString()}`} icon={<ReceiptLongIcon />} color="secondary.main" /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

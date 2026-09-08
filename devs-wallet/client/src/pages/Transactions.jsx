import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, MenuItem, Grid, Chip, Pagination, CircularProgress, Alert,
} from '@mui/material';
import { getTransactions } from '../services/transactionService';

const TYPES = ['deposit', 'withdraw', 'transfer_in', 'transfer_out', 'bill_payment', 'package_purchase'];

export default function Transactions() {
  const [data, setData] = useState({ transactions: [], pagination: { totalPages: 1 } });
  const [filters, setFilters] = useState({ type: '', search: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getTransactions({ ...filters, limit: 10 })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Transactions</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth select label="Type" value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              >
                <MenuItem value="">All</MenuItem>
                {TYPES.map((t) => <MenuItem key={t} value={t}>{t.replace('_', ' ')}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth label="Search description" value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="right">Balance After</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{tx.type.replace('_', ' ')}</TableCell>
                      <TableCell align="right" sx={{ color: ['deposit', 'transfer_in'].includes(tx.type) ? 'success.main' : 'error.main', fontWeight: 600 }}>
                        {['deposit', 'transfer_in'].includes(tx.type) ? '+' : '-'} Rs {Number(tx.amount).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">Rs {Number(tx.balance_after).toLocaleString()}</TableCell>
                      <TableCell><Chip size="small" label={tx.status} color={tx.status === 'success' ? 'success' : 'warning'} /></TableCell>
                    </TableRow>
                  ))}
                  {data.transactions.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center">No transactions found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={data.pagination.totalPages || 1}
                  page={filters.page}
                  onChange={(e, page) => setFilters({ ...filters, page })}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

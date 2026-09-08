import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export default function StatCard({ title, value, icon, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      </CardContent>
    </Card>
  );
}

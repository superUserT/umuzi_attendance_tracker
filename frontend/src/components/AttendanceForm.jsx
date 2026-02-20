import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Button, Card, CardContent, Container, TextField, 
  Typography, CircularProgress, Alert, Stack
} from '@mui/material';
import { CheckCircle, XCircle, UserCheck } from 'lucide-react';

const AttendanceForm = () => {
  const { eventId } = useParams();
  const [status, setStatus] = useState('loading'); 
  const [eventDetails, setEventDetails] = useState(null);
  const [formData, setFormData] = useState({ name: '', surname: '', email: '' });
  const [errorMsg, setErrorMsg] = useState('');

 
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    axios.get(`${API_URL}/api/events/${eventId}/validate`)
      .then(res => {
        setEventDetails(res.data);
        setStatus('valid');
      })
      .catch(() => setStatus('expired'));
  }, [eventId, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/attend`, { ...formData, eventId });
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error submitting');
    }
  };

  if (status === 'loading') return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
  
  if (status === 'expired') return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <XCircle size={64} color="#d32f2f" style={{ margin: '0 auto' }} />
      <Typography variant="h4" color="error" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
        Event Expired
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This QR code is no longer valid for attendance.
      </Typography>
    </Container>
  );

  if (status === 'success') return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <CheckCircle size={64} color="#2e7d32" style={{ margin: '0 auto' }} />
      <Typography variant="h4" color="success.main" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
        Attendance Logged!
      </Typography>
      <Typography variant="h6">
        You have earned <b>{eventDetails.points}</b> points.
      </Typography>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
             <UserCheck size={40} color="#1976d2" />
             <Typography variant="h5" component="h1" align="center" sx={{ mt: 1, fontWeight: 'bold' }}>
              {eventDetails.eventTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Host: {eventDetails.host}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter details to claim <b>{eventDetails.points} points</b>
            </Typography>
          </Stack>

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField 
              label="First Name" variant="outlined" fullWidth required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <TextField 
              label="Surname" variant="outlined" fullWidth required
              value={formData.surname}
              onChange={e => setFormData({...formData, surname: e.target.value})}
            />
            <TextField 
              label="Email Address" type="email" variant="outlined" fullWidth required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <Button 
              variant="contained" size="large" type="submit" 
              sx={{ mt: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Confirm Attendance
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AttendanceForm;
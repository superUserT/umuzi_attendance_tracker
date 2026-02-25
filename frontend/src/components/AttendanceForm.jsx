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
  
  const [formData, setFormData] = useState({ 
    name: '', surname: '', email: '',
    motivation: '', commChannel: '', funActivity: '', umuziMetaphor: '', lookingForward: ''
  });
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

  if (status === 'loading') return (<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>);
  if (status === 'expired') return (<Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', px: 2 }}><XCircle size={64} color="#d32f2f" style={{ margin: '0 auto' }} /><Typography variant="h4" color="error" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>Event Expired</Typography></Container>);
  if (status === 'success') return (<Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center', px: 2 }}><CheckCircle size={64} color="#2e7d32" style={{ margin: '0 auto' }} /><Typography variant="h4" color="success.main" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>Attendance Logged!</Typography></Container>);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 3 }, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack alignItems="center" mb={3}>
             <UserCheck size={40} color="#1976d2" />
             <Typography variant="h5" component="h1" align="center" sx={{ mt: 1, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>{eventDetails.eventTitle}</Typography>
             <Typography variant="body2" color="text.secondary" align="center">Host: {eventDetails.host}</Typography>
          </Stack>

          {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="First Name" variant="outlined" fullWidth required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <TextField label="Surname" variant="outlined" fullWidth required value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} />
              <TextField label="Email Address" type="email" variant="outlined" fullWidth required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: { xs: 1, sm: 2 }, borderBottom: '1px solid #eee', pb: 1 }}>Quick Questionnaire</Typography>
            <TextField label="1. What motivated you to attend today's session?" variant="outlined" fullWidth required multiline rows={2} value={formData.motivation} onChange={e => setFormData({...formData, motivation: e.target.value})} />
            <TextField label="2. Which channel did you see the comms about today?" variant="outlined" fullWidth required value={formData.commChannel} onChange={e => setFormData({...formData, commChannel: e.target.value})} />
            <TextField label="3. What do you typically do for fun?" variant="outlined" fullWidth required multiline rows={2} value={formData.funActivity} onChange={e => setFormData({...formData, funActivity: e.target.value})} />
            <TextField label="4. If Umuzi was a (food/colour/mood/car), what would it be?" variant="outlined" fullWidth required value={formData.umuziMetaphor} onChange={e => setFormData({...formData, umuziMetaphor: e.target.value})} />
            <TextField label="5. What are you most looking forward to this year?" variant="outlined" fullWidth required multiline rows={2} value={formData.lookingForward} onChange={e => setFormData({...formData, lookingForward: e.target.value})} />

            <Button variant="contained" size="large" type="submit" sx={{ mt: 2, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>Confirm Attendance</Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};
export default AttendanceForm;
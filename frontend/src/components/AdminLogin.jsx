import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import {
  Container,
  Card,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
          const response = await fetch('/api/admin/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
              throw new Error('Invalid credentials');
          }

          const data = await response.json();
          localStorage.setItem('adminToken', data.token);
          window.location.href = '/admin/dashboard';
      } catch (err) {
          setError(err.message || 'Login failed');
      } finally {
          setLoading(false);
      }
  };

  return (
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', px: { xs: 2, sm: 3 } }}>
          <Card elevation={4} sx={{ width: '100%', p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold', fontSize: { xs: '2rem', sm: '2.125rem' } }}>
                  Admin Login
              </Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <form onSubmit={handleSubmit}>
                  <TextField
                      fullWidth
                      id="email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      margin="normal"
                      InputProps={{
                          startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#666' }} />,
                      }}
                  />
                  <TextField
                      fullWidth
                      id="password"
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      margin="normal"
                      InputProps={{
                          startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#666' }} />,
                      }}
                  />
                  <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
                  >
                      {loading ? <CircularProgress size={24} /> : 'Login'}
                  </Button>
              </form>
          </Card>
      </Container>
  );
}
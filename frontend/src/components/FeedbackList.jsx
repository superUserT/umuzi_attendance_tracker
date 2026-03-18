import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('/api/feedback', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setFeedback(data);
        } else {
          console.error('Failed to fetch feedback');
        }
      } catch (error) {
        console.error('Failed to fetch feedback', error);
      }
    };

    if (user && user.role === 'admin') {
      fetchFeedback();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Typography>You are not authorized to view this page.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ marginTop: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Feedback
        </Typography>
        {feedback.map((item) => (
          <Card key={item._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{item.name} ({item.email})</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>{item.feedback}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {new Date(item.date).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default FeedbackList;

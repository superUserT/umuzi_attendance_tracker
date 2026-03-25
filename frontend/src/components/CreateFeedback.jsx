import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import QRCode from 'qrcode';
import {
  Container,
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

export default function CreateFeedback() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'text', options: [] }
  ]);
  const [createdForm, setCreatedForm] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', questionType: 'text', options: [] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ title, description, questions }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create feedback form");
      }
      
      const newForm = await res.json();
      setCreatedForm(newForm);
      
      // Generate a QR code that points the user to the scan/response route for this specific form
      const feedbackUrl = `${window.location.origin}/feedback/scan/${newForm._id}`;
      const qrDataUrl = await QRCode.toDataURL(feedbackUrl, { width: 300, margin: 2 });
      setQrCodeUrl(qrDataUrl);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If the form is created successfully, show the QR Code
  if (createdForm && qrCodeUrl) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Card elevation={4} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h4" color="success.main" gutterBottom>
            Form Created Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Users can scan this QR code to submit their feedback.
          </Typography>
          <Box sx={{ my: 3 }}>
            <img src={qrCodeUrl} alt="Feedback Form QR Code" style={{ width: '100%', maxWidth: '300px' }} />
          </Box>
          <Button 
            variant="contained" 
            href={qrCodeUrl} 
            download={`${createdForm.title.replace(/\s+/g, '_')}_QR.png`}
            sx={{ mt: 2, fontSize: '1.1rem' }}
          >
            Download QR Code
          </Button>
        </Card>
      </Container>
    );
  }

  // Otherwise, show the creation form
  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Card elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create Feedback Form
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Form Title" value={title} onChange={(e) => setTitle(e.target.value)} required margin="normal" />
          <TextField fullWidth label="Description (Optional)" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={2} />
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Questions</Typography>
          
          {questions.map((q, qIndex) => (
            <Box key={qIndex} sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, backgroundColor: '#fafafa' }}>
              <TextField fullWidth label={`Question ${qIndex + 1}`} value={q.questionText} onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)} required sx={{ mb: 2, backgroundColor: '#fff' }} />
              
              <FormControl fullWidth sx={{ mb: 2, backgroundColor: '#fff' }}>
                <InputLabel>Question Type</InputLabel>
                <Select value={q.questionType} label="Question Type" onChange={(e) => handleQuestionChange(qIndex, 'questionType', e.target.value)}>
                  <MenuItem value="text">Text Answer</MenuItem>
                  <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                  <MenuItem value="rating">Rating (1-5)</MenuItem>
                </Select>
              </FormControl>

              {q.questionType === 'multiple_choice' && (
                <Box sx={{ pl: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Options:</Typography>
                  {q.options.map((opt, oIndex) => (
                    <TextField key={oIndex} size="small" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} sx={{ mt: 1, mr: 1, backgroundColor: '#fff' }} required />
                  ))}
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => handleAddOption(qIndex)}>+ Add Option</Button>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
          
          <Button variant="text" onClick={handleAddQuestion} sx={{ mb: 4, fontWeight: 'bold' }}>
            + Add Another Question
          </Button>

          <Button fullWidth type="submit" variant="contained" disabled={loading} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Form & QR Code'}
          </Button>
        </form>
      </Card>
    </Container>
  );
}
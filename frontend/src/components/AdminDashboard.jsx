import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import * as XLSX from 'xlsx';
import { 
  Box, Button, Card, CardContent, Container, Grid, TextField, 
  Typography, Select, MenuItem, FormControl, InputLabel, 
  Table as MuiTable, TableBody, TableCell as MuiTableCell, 
  TableContainer, TableHead, TableRow as MuiTableRow, 
  Paper, Chip, Stack, IconButton, Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { 
  Calendar, Users, Trophy, Clock, Plus, Download, 
  FileSpreadsheet, Share2, Info, User
} from 'lucide-react';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', host: '', eventType: 'short_online', durationMinutes: 60
  });
  const [selectedUser, setSelectedUser] = useState(null);

  // 1. GET API URL FROM ENV
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // 2. GET FRONTEND URL (For QR Codes)
  const APP_URL = window.location.origin;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/data`);
      setEvents(res.data.events);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/events`, formData);
      fetchData(); 
      setFormData({ title: '', description: '', host: '', eventType: 'short_online', durationMinutes: 60 });
    } catch (err) {
      alert("Error creating event");
    }
  };

  const exportToExcel = () => {
    const data = [];
    users.forEach(user => {
      if (user.attendanceLog && user.attendanceLog.length > 0) {
        user.attendanceLog.forEach(log => {
          data.push({
            "First Name": user.name,
            "Surname": user.surname,
            "Email": user.email,
            "Total Points": user.totalPoints,
            "Event Attended": log.eventTitle,
            "Event Host": log.eventHost,
            "Points Gained": log.pointsEarned,
            "Date Scanned": new Date(log.dateScanned).toLocaleString()
          });
        });
      } else {
        data.push({
          "First Name": user.name,
          "Surname": user.surname,
          "Email": user.email,
          "Total Points": user.totalPoints,
          "Event Attended": "N/A",
          "Event Host": "N/A",
          "Points Gained": 0,
          "Date Scanned": "N/A"
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    XLSX.writeFile(workbook, "Gamified_Attendance_Report.xlsx");
  };

  const downloadQR = (eventId, eventTitle) => {
    const svg = document.getElementById(`qr-${eventId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${eventTitle}-QR.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Trophy color="#f59e0b" size={40} /> Gamified Attendance
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        
        {/* CREATE EVENT FORM */}
        <Grid item xs={12} md={5}>
          <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                <Calendar className="text-blue-600" /> Create Event
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField 
                  label="Event Title" variant="outlined" fullWidth required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                <TextField 
                  label="Host Name" variant="outlined" fullWidth required
                  value={formData.host}
                  onChange={e => setFormData({...formData, host: e.target.value})} 
                />
                <TextField 
                  label="Description" variant="outlined" fullWidth multiline rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={formData.eventType}
                    label="Event Type"
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                  >
                    <MenuItem value="short_online">Short Online (5 pts)</MenuItem>
                    <MenuItem value="long_online">Long Online (10 pts)</MenuItem>
                    <MenuItem value="in_person">In Person (15 pts)</MenuItem>
                  </Select>
                </FormControl>
                <TextField 
                  label="Duration (Minutes)" type="number" variant="outlined" fullWidth required
                  value={formData.durationMinutes}
                  onChange={e => setFormData({...formData, durationMinutes: e.target.value})} 
                />
                <Button variant="contained" size="large" type="submit" startIcon={<Plus size={20} />} sx={{ py: 1.5, fontWeight: 'bold' }}>
                  Generate Event
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* LEADERBOARD */}
        <Grid item xs={12} md={7}>
          <Card elevation={4} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                  <Users className="text-green-600" /> Leaderboard
                </Typography>
                <Button 
                  variant="outlined" color="success"
                  startIcon={<FileSpreadsheet size={18} />} 
                  onClick={exportToExcel}
                  size="small"
                >
                  Export Excel
                </Button>
              </Stack>
              <TableContainer component={Paper} sx={{ maxHeight: 400, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <MuiTable stickyHeader>
                  <TableHead>
                    <MuiTableRow>
                      <MuiTableCell sx={{ fontWeight: 'bold' }}>Rank</MuiTableCell>
                      <MuiTableCell sx={{ fontWeight: 'bold' }}>User</MuiTableCell>
                      <MuiTableCell align="center" sx={{ fontWeight: 'bold' }}>Events</MuiTableCell>
                      <MuiTableCell align="right" sx={{ fontWeight: 'bold' }}>Points</MuiTableCell>
                      <MuiTableCell align="center">Details</MuiTableCell>
                    </MuiTableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, idx) => (
                      <MuiTableRow key={user._id} hover>
                        <MuiTableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>#{idx + 1}</MuiTableCell>
                        <MuiTableCell>
                          <Typography variant="body2" fontWeight={500}>{user.name} {user.surname}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </MuiTableCell>
                        <MuiTableCell align="center">
                          <Chip label={user.attendanceLog?.length || 0} size="small" />
                        </MuiTableCell>
                        <MuiTableCell align="right" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{user.totalPoints}</MuiTableCell>
                        <MuiTableCell align="center">
                          <IconButton size="small" onClick={() => setSelectedUser(user)}>
                            <Info size={18} />
                          </IconButton>
                        </MuiTableCell>
                      </MuiTableRow>
                    ))}
                  </TableBody>
                </MuiTable>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ACTIVE EVENTS */}
      <Box sx={{ mt: 8, width: '100%' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
          Active Events
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {events.map(event => (
            <Grid item xs={12} sm={6} md={4} key={event._id}>
              <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center', p: 1 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{event.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Host: {event.host}</Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 2 }}>{event.description}</Typography>
                  
                  {/* QR CODE LINK USES APP_URL (Frontend URL) */}
                  <Box sx={{ p: 2, bgcolor: 'white', border: '1px dashed #ccc', borderRadius: 2, display: 'inline-block' }}>
                    <QRCode id={`qr-${event._id}`} value={`${APP_URL}/attend/${event._id}`} size={150} />
                  </Box>
                  
                  <Stack direction="row" justifyContent="center" gap={1} mt={2}>
                    <Tooltip title="Download QR">
                        <IconButton onClick={() => downloadQR(event._id, event.title)} color="primary">
                          <Download size={20} />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Copy Link">
                        <IconButton onClick={() => navigator.clipboard.writeText(`${APP_URL}/attend/${event._id}`)}>
                          <Share2 size={20} />
                        </IconButton>
                     </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* USER DETAILS DIALOG */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <User /> Attendance History: {selectedUser?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser?.attendanceLog?.length > 0 ? (
            <Stack spacing={2}>
              {selectedUser.attendanceLog.map((log, index) => (
                <Box key={index} sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">{log.eventTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">Host: {log.eventHost}</Typography>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption">Date: {new Date(log.dateScanned).toLocaleDateString()}</Typography>
                    <Chip label={`+${log.pointsEarned} pts`} size="small" color="success" />
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No events attended yet.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
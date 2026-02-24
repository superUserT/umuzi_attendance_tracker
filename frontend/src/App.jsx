import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AttendanceForm from './components/AttendanceForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/attend/:eventId" element={<AttendanceForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
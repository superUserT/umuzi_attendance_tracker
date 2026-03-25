import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AttendanceForm from './components/AttendanceForm';


function App() {
  return (
    <Router>
      {/* Removed bg-gray-50 so the background image is visible */}
      <div className="min-h-screen text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/attend/:eventId" element={<AttendanceForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
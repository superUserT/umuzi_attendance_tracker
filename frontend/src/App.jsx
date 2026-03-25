import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AttendanceForm from './components/AttendanceForm';
import AdminLogin from './components/AdminLogin'; 
import { AuthProvider, AuthContext } from './context/AuthContext'; 


const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  
  return user && user.role === "admin" ? children : <Navigate to="/login" />;
};

function App() {
  return (
    
    <AuthProvider>
      <Router>
        <div className="min-h-screen text-gray-900 font-sans">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<AdminLogin />} />
            
            {/* The attendance form remains public so anyone can scan the QR code */}
            <Route path="/attend/:eventId" element={<AttendanceForm />} />

            {/* --- Protected Routes --- */}
            {/* Wrap the AdminDashboard in the AdminRoute component */}
            <Route 
              path="/" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
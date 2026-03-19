import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  CssBaseline,
} from "@mui/material";
import AdminDashboard from "./components/AdminDashboard";
import AttendanceForm from "./components/AttendanceForm";
import AdminLogin from "./components/AdminLogin";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackList from "./components/FeedbackList";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Navbar />
        <Container>
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route
              path="/admin/feedback"
              element={
                <AdminRoute>
                  <FeedbackList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="/attend/:eventId" element={<AttendanceForm />} />
            <Route path="/" element={<Navigate to="/admin" />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Umuzi
          </Link>
        </Typography>
        {user ? (
          <>
            {user.role === "admin" && (
              <Button color="inherit" component={Link} to="/admin">
                Admin Dashboard
              </Button>
            )}
            {user.role === "admin" && (
              <Button color="inherit" component={Link} to="/admin/feedback">
                Feedback
              </Button>
            )}
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Admin Login
            </Button>
            <Button color="inherit" component={Link} to="/feedback">
              Feedback
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user && user.role === "admin" ? children : <Navigate to="/login" />;
};

export default App;

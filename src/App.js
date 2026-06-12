import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar           from './components/Navbar';
import OnboardingGuide  from './components/OnboardingGuide';
import InstallPrompt    from './components/InstallPrompt';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Reports          from './pages/Reports';
import AdminDashboard   from './pages/AdminDashboard';
import DriverDashboard  from './pages/DriverDashboard';
import Leaderboard      from './pages/Leaderboard';
import Profile          from './pages/Profile';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};
const DriverRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'driver') return <Navigate to="/" />;
  return children;
};
const HomeRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')  return <Navigate to="/admin" />;
  if (user.role === 'driver') return <Navigate to="/driver" />;
  return <Dashboard />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <OnboardingGuide />
      <InstallPrompt />
      <Routes>
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/"            element={<HomeRoute />} />
        <Route path="/reports"     element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/admin"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/driver"      element={<DriverRoute><DriverDashboard /></DriverRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
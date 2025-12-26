import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RunningLeagues from './pages/RunningLeagues';
import LeagueManagement from './pages/LeagueManagement';
import ActivityLog from './pages/ActivityLog';
import FinishedLeaguesLog from './pages/FinishedLeaguesLog';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import RealtimeTest from './pages/RealtimeTest';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Layout from './components/Layout';
import { dataService } from './services/dataService';
import { User } from './types';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(dataService.getCurrentUser());

  useEffect(() => {
    // Sync storage user on mount
    const user = dataService.getCurrentUser();
    if (user) {
      dataService.ensureUserStats(user.id);
    }
    setCurrentUser(user);
  }, []);

  const handleLogin = (user: User) => {
    dataService.setCurrentUser(user);
    dataService.ensureUserStats(user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    dataService.setCurrentUser(null);
    setCurrentUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />}
        />

        {/* Public routes (no auth required) */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {currentUser && (
          <Route element={<Layout user={currentUser} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
            <Route path="/leagues" element={<RunningLeagues user={currentUser} />} />
            <Route path="/manage" element={<LeagueManagement user={currentUser} />} />
            <Route path="/profile" element={<Profile user={currentUser} />} />
            <Route path="/log" element={<ActivityLog user={currentUser} />} />
            <Route path="/leagues-log" element={<FinishedLeaguesLog user={currentUser} />} />
            <Route path="/settings" element={<Settings user={currentUser} />} />
            <Route path="/realtime-test" element={<RealtimeTest />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </HashRouter>
  );
};

export default App;

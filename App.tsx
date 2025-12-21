
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import RunningLeagues from './pages/RunningLeagues';
import LeagueManagement from './pages/LeagueManagement';
import Layout from './components/Layout';
import { storage } from './services/storage';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());

  useEffect(() => {
    // Sync storage user on mount
    const user = storage.getCurrentUser();
    if (user) {
      storage.ensureUserStats(user.id);
    }
    setCurrentUser(user);
  }, []);

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    storage.ensureUserStats(user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/" 
          element={currentUser ? <Navigate to="/dashboard" /> : <Landing onLogin={handleLogin} />} 
        />
        
        {currentUser && (
          <Route element={<Layout user={currentUser} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
            <Route path="/leagues" element={<RunningLeagues user={currentUser} />} />
            <Route path="/manage" element={<LeagueManagement user={currentUser} />} />
            <Route path="/profile" element={<div className="p-8 text-xl">Profile coming soon...</div>} />
            <Route path="/settings" element={<div className="p-8 text-xl">Settings coming soon...</div>} />
          </Route>
        )}
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;

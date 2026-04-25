import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChannelPage } from './pages/ChannelPage';
import { ChannelManagePage } from './pages/ChannelManagePage';
import { CreateChannelPage } from './pages/CreateChannelPage';
import { SearchPage } from './pages/SearchPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/channel/:slug" element={<ChannelPage />} />
          <Route path="/channel/:slug/manage" element={
            <ProtectedRoute>
              <ChannelManagePage />
            </ProtectedRoute>
          } />
          <Route path="/join/:slug" element={<ChannelPage />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/create-channel" element={
            <ProtectedRoute>
              <CreateChannelPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;

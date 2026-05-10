import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { StudentPage } from './pages/StudentPage';
import { RecruiterPage } from './pages/RecruiterPage';
import { AdminPage } from './pages/AdminPage';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!userProfile) return null;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {userProfile.role === 'student' && <StudentPage activeTab={activeTab} />}
      {userProfile.role === 'recruiter' && <RecruiterPage activeTab={activeTab} />}
      {userProfile.role === 'admin' && <AdminPage activeTab={activeTab} />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppContent />
        <Toaster position="top-right" richColors />
      </AuthGuard>
    </AuthProvider>
  );
}

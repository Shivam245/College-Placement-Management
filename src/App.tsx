import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { StudentView } from './components/StudentView';
import { RecruiterView } from './components/RecruiterView';
import { AdminView } from './components/AdminView';
import { Toaster } from 'sonner';

const AppContent: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!userProfile) return null;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {userProfile.role === 'student' && <StudentView activeTab={activeTab} />}
      {userProfile.role === 'recruiter' && <RecruiterView activeTab={activeTab} />}
      {userProfile.role === 'admin' && <AdminView activeTab={activeTab} />}
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

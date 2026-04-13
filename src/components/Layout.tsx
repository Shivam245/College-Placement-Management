import React from 'react';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { GraduationCap, Briefcase, ShieldCheck, LogOut, LayoutDashboard, BriefcaseBusiness, Users, FileText, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { userProfile, logout } = useAuth();

  const menuItems = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'jobs', label: 'Job Portal', icon: BriefcaseBusiness },
      { id: 'applications', label: 'My Applications', icon: FileText },
      { id: 'profile', label: 'Profile', icon: Settings },
    ],
    recruiter: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-jobs', label: 'My Drives', icon: BriefcaseBusiness },
      { id: 'applicants', label: 'Applicants', icon: Users },
      { id: 'profile', label: 'Company Profile', icon: Settings },
    ],
    admin: [
      { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
      { id: 'manage-jobs', label: 'Manage Drives', icon: BriefcaseBusiness },
      { id: 'manage-users', label: 'Manage Users', icon: Users },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  };

  const currentMenu = userProfile ? menuItems[userProfile.role] : [];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl tracking-tight">CampusDrive</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
              {userProfile?.photoURL ? (
                <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                  {userProfile?.displayName?.[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{userProfile?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

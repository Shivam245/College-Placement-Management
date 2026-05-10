import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import { userService } from '../services/users';
import { toast } from 'sonner';
import { Dashboard } from './recruiter/Dashboard';
import { ManageJobs } from './recruiter/ManageJobs';
import { Applicants } from './recruiter/Applicants';
import { Profile } from './recruiter/Profile';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface RecruiterPageProps {
  activeTab: string;
}

export const RecruiterPage: React.FC<RecruiterPageProps> = ({ activeTab }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { jobs, createJob, toggleJobStatus, deleteJob } = useJobs();
  const { applications, updateStatus } = useApplications();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    minCGPA: 7.0,
    eligibleBranches: [] as string[],
    deadline: ''
  });

  const myJobs = jobs.filter(j => j.companyId === user?.uid);
  const myApplications = applications.filter(app => myJobs.some(job => job.id === app.jobId));

  const handleUpdateMyProfile = async (data: any) => {
    try {
      await userService.updateMyProfile(data);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleCreateJobSubmit = async () => {
    const success = await createJob({
      ...newJob,
      companyName: userProfile?.profile?.companyName || userProfile?.displayName || 'Company'
    });
    if (success) {
      setIsCreateDialogOpen(false);
      setNewJob({ title: '', description: '', minCGPA: 7.0, eligibleBranches: [], deadline: '' });
    }
  };

  const AVAILABLE_BRANCHES = [
    { id: 'CSE', label: 'Computer Science' },
    { id: 'ECE', label: 'Electronics & Comm.' },
    { id: 'ME', label: 'Mechanical Eng.' },
    { id: 'CE', label: 'Civil Eng.' },
    { id: 'EE', label: 'Electrical Eng.' },
  ];

  const handleBranchToggle = (branchId: string) => {
    setNewJob(prev => {
      const current = prev.eligibleBranches;
      const updated = current.includes(branchId)
        ? current.filter(b => b !== branchId)
        : [...current, branchId];
      return { ...prev, eligibleBranches: updated };
    });
  };

  const renderContent = () => {
    if (isEditingProfile || activeTab === 'profile') {
      return <Profile userProfile={userProfile} onUpdate={handleUpdateMyProfile} onCancel={() => setIsEditingProfile(false)} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            jobs={myJobs} 
            applications={myApplications} 
            userProfile={userProfile} 
            onUpdateStatus={updateStatus}
            onEditProfile={() => setIsEditingProfile(true)}
          />
        );
      case 'my-jobs':
        return (
          <ManageJobs 
            jobs={myJobs} 
            applications={applications} 
            onCreateClick={() => setIsCreateDialogOpen(true)}
            onToggleStatus={toggleJobStatus}
            onDelete={deleteJob}
          />
        );
      case 'applicants':
        return <Applicants applications={myApplications} onUpdateStatus={updateStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Placement Drive</DialogTitle>
            <DialogDescription>Fill in the details for the new job opening.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input 
                placeholder="Software Engineer Intern" 
                value={newJob.title} 
                onChange={(e) => setNewJob({...newJob, title: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                placeholder="Role details..." 
                value={newJob.description} 
                onChange={(e) => setNewJob({...newJob, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min CGPA</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  value={newJob.minCGPA} 
                  onChange={(e) => setNewJob({...newJob, minCGPA: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Application Deadline</Label>
                <Input 
                  type="date" 
                  value={newJob.deadline} 
                  onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Eligible Branches</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {AVAILABLE_BRANCHES.map((branch) => (
                  <div key={branch.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`branch-${branch.id}`}
                      checked={newJob.eligibleBranches.includes(branch.id)}
                      onChange={() => handleBranchToggle(branch.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`branch-${branch.id}`} className="text-sm cursor-pointer">{branch.id}</Label>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">If none selected, it will be open to all branches.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateJobSubmit}>Create Drive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

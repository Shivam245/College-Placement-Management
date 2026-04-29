import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { JobDrive, Application } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Users, Briefcase, CheckCircle2, XCircle, MoreVertical, ExternalLink, BriefcaseBusiness } from 'lucide-react';
import { toast } from 'sonner';

export const RecruiterView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { user, userProfile } = useAuth();
  const [myJobs, setMyJobs] = useState<JobDrive[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    minCGPA: 7.0,
    eligibleBranches: [] as string[],
    deadline: ''
  });
  const [profileForm, setProfileForm] = useState({
    companyName: userProfile?.profile?.companyName || '',
    designation: userProfile?.profile?.designation || '',
    displayName: userProfile?.displayName || ''
  });

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications')
      ]);
      if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        setMyJobs(jobs.filter((j: any) => j.companyId === user?.uid));
      }
      if (appsRes.ok) setAllApplications(await appsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleCreateJob = async () => {
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newJob,
          companyName: userProfile?.profile?.companyName || userProfile?.displayName || 'Company'
        })
      });
      if (!res.ok) throw new Error("Failed to create drive");
      setIsCreateDialogOpen(false);
      setNewJob({ title: '', description: '', minCGPA: 7.0, eligibleBranches: [], deadline: '' });
      toast.success("Placement drive created successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to create drive.");
    }
  };

  const handleUpdateStatus = async (appId: string, status: Application['status']) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success(`Application marked as ${status}`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'closed' : 'active' })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete drive");
      toast.success("Drive deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete drive.");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            companyName: profileForm.companyName,
            designation: profileForm.designation
          }
        })
      });
      
      const data = await res.json();
      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      toast.success("Company profile updated successfully!");
      setIsEditingProfile(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  const myApplications = allApplications.filter(app => myJobs.some(job => job.id === app.jobId));

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
      if (current.includes(branchId)) {
        return { ...prev, eligibleBranches: current.filter(b => b !== branchId) };
      } else {
        return { ...prev, eligibleBranches: [...current, branchId] };
      }
    });
  };

  const renderCreateDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Placement Drive</DialogTitle>
          <DialogDescription>Fill in the details for the new job opening.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input placeholder="Software Engineer Intern" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input placeholder="Role details..." value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min CGPA</Label>
              <Input type="number" step="0.1" value={newJob.minCGPA} onChange={(e) => setNewJob({...newJob, minCGPA: Number(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Input type="date" value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} />
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
          <Button onClick={handleCreateJob}>Create Drive</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  let content = null;

  if (activeTab === 'dashboard') {
    content = (
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Manage your placement drives and candidates.</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Drive
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Active Drives
              </CardDescription>
              <CardTitle className="text-2xl">{myJobs.filter(j => j.status === 'active').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Total Applicants
              </CardDescription>
              <CardTitle className="text-2xl">{myApplications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" /> Selected
              </CardDescription>
              <CardTitle className="text-2xl">{myApplications.filter(a => a.status === 'selected').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Applicants</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Drive</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApplications.slice(0, 5).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{(app as any).jobTitle}</TableCell>
                      <TableCell>{app.studentCGPA}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'selected' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(app.id, 'shortlisted')}>
                            Shortlist
                          </Button>
                          <Button size="sm" variant="default" onClick={() => handleUpdateStatus(app.id, 'selected')}>
                            Select
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="w-5 h-5" /> Company Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Company Name</p>
                <p className="text-sm text-muted-foreground">{userProfile?.profile?.companyName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Your Designation</p>
                <p className="text-sm text-muted-foreground">{userProfile?.profile?.designation || 'Not set'}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {
                setProfileForm({
                  companyName: userProfile?.profile?.companyName || '',
                  designation: userProfile?.profile?.designation || '',
                  displayName: userProfile?.displayName || ''
                });
                setIsEditingProfile(true);
              }}>
                Edit Company Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'my-jobs') {
    content = (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My Placement Drives</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create New
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{job.title}</CardTitle>
                  <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
                </div>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Min CGPA:</span>
                  <span className="font-medium">{job.minCGPA}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Branches:</span>
                  <span className="font-medium">{job.eligibleBranches.join(', ') || 'All'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applicants:</span>
                  <span className="font-medium">{allApplications.filter(a => a.jobId === job.id).length}</span>
                </div>
                {job.deadline && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium text-red-500">{new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleToggleJobStatus(job.id, job.status)}>
                  {job.status === 'active' ? 'Close Drive' : 'Open Drive'}
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteJob(job.id)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'applicants') {
    content = (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Applicant Management</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Drive</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.studentName}</p>
                        <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{(app as any).jobTitle}</TableCell>
                    <TableCell>{app.studentCGPA}</TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
                        <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> View Resume
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Resume</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'selected' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(app.id, 'shortlisted')}>Shortlist</Button>
                        <Button size="sm" variant="default" onClick={() => handleUpdateStatus(app.id, 'selected')}>Select</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(app.id, 'rejected')}>Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activeTab === 'profile' || isEditingProfile) {
    content = (
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">Manage your company information and recruiter details.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Recruiter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input 
                id="displayName" 
                value={profileForm.displayName} 
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground italic">Name can only be changed by admin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input 
                  id="companyName" 
                  placeholder="Google, Microsoft, etc." 
                  value={profileForm.companyName} 
                  onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input 
                  id="designation" 
                  placeholder="HR Manager, Tech Lead, etc." 
                  value={profileForm.designation} 
                  onChange={(e) => setProfileForm({...profileForm, designation: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button className="flex-1" onClick={handleUpdateProfile}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      {content}
      {renderCreateDialog()}
    </>
  );
};

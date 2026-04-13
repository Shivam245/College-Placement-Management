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
import { Briefcase, CheckCircle2, Clock, XCircle, Search, Filter, User, BookOpen, Award, FileText } from 'lucide-react';
import { toast } from 'sonner';

export const StudentView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    cgpa: userProfile?.profile?.cgpa || 0,
    branch: userProfile?.profile?.branch || '',
    skills: userProfile?.profile?.skills?.join(', ') || '',
    resumeUrl: userProfile?.profile?.resumeUrl || ''
  });

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications')
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (appsRes.ok) setApplications(await appsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Poll every 5s for "real-time" feel
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleApply = async (job: JobDrive) => {
    if (!userProfile?.profile?.cgpa || !userProfile?.profile?.branch) {
      toast.error("Please complete your profile (CGPA & Branch) before applying.");
      return;
    }

    if (userProfile.profile.cgpa < job.minCGPA) {
      toast.error("You do not meet the minimum CGPA requirement for this drive.");
      return;
    }

    if (job.eligibleBranches.length > 0 && !job.eligibleBranches.includes(userProfile.profile.branch)) {
      toast.error("Your branch is not eligible for this drive.");
      return;
    }

    const alreadyApplied = applications.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      toast.error("You have already applied for this drive.");
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          studentName: userProfile.displayName,
          studentEmail: userProfile.email,
          studentCGPA: userProfile.profile.cgpa,
          resumeUrl: userProfile.profile.resumeUrl || ''
        })
      });
      if (!res.ok) throw new Error("Failed to apply");
      toast.success("Application submitted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to submit application.");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            cgpa: Number(profileForm.cgpa),
            branch: profileForm.branch,
            skills: profileForm.skills.split(',').map(s => s.trim()),
            resumeUrl: profileForm.resumeUrl
          }
        })
      });
      
      const data = await res.json();
      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        await refreshProfile(); // This will trigger a logout in AuthContext
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      await refreshProfile();
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.");
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    try {
      const res = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      setProfileForm(prev => ({ ...prev, resumeUrl: data.resumeUrl }));
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  if (activeTab === 'dashboard') {
    const stats = {
      applied: applications.length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      selected: applications.filter(a => a.status === 'selected').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userProfile?.displayName}!</h1>
          <p className="text-muted-foreground">Track your placement journey and upcoming drives.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Applied
              </CardDescription>
              <CardTitle className="text-2xl">{stats.applied}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-blue-500">
                <Filter className="w-4 h-4" /> Shortlisted
              </CardDescription>
              <CardTitle className="text-2xl">{stats.shortlisted}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-green-500">
                <CheckCircle2 className="w-4 h-4" /> Selected
              </CardDescription>
              <CardTitle className="text-2xl">{stats.selected}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-red-500">
                <XCircle className="w-4 h-4" /> Rejected
              </CardDescription>
              <CardTitle className="text-2xl">{stats.rejected}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No applications yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.slice(0, 5).map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{(app as any).companyName}</TableCell>
                        <TableCell>{(app as any).jobTitle}</TableCell>
                        <TableCell>
                          <Badge variant={
                            app.status === 'selected' ? 'default' : 
                            app.status === 'rejected' ? 'destructive' : 
                            app.status === 'shortlisted' ? 'secondary' : 'outline'
                          }>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Branch</p>
                  <p className="text-sm text-muted-foreground">{userProfile?.profile?.branch || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">CGPA</p>
                  <p className="text-sm text-muted-foreground">{userProfile?.profile?.cgpa || 'Not set'}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Resume</p>
                {userProfile?.profile?.resumeUrl ? (
                  <a 
                    href={userProfile.profile.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> View Resume
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">No resume uploaded</span>
                )}
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {userProfile?.profile?.skills?.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                  )) || <span className="text-sm text-muted-foreground">No skills added</span>}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {
                setProfileForm({
                  cgpa: userProfile?.profile?.cgpa || 0,
                  branch: userProfile?.profile?.branch || '',
                  skills: userProfile?.profile?.skills?.join(', ') || '',
                  resumeUrl: userProfile?.profile?.resumeUrl || ''
                });
                setIsEditingProfile(true);
              }}>
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'jobs') {
    const filteredJobs = jobs.filter(j => 
      j.status === 'active' && 
      (j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       j.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Portal</h1>
            <p className="text-muted-foreground">Explore and apply for active placement drives.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs or companies..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const isEligible = (userProfile?.profile?.cgpa || 0) >= job.minCGPA && 
                             (job.eligibleBranches.length === 0 || job.eligibleBranches.includes(userProfile?.profile?.branch || ''));
            const hasApplied = applications.some(app => app.jobId === job.id);
            const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date(new Date().setHours(0,0,0,0)) : false;

            return (
              <Card key={job.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{job.companyName}</Badge>
                    {hasApplied && <Badge className="bg-green-500">Applied</Badge>}
                  </div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{job.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase font-semibold">Min CGPA</p>
                      <p className="font-medium">{job.minCGPA}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs uppercase font-semibold">Branches</p>
                      <p className="font-medium truncate">
                        {job.eligibleBranches.length > 0 ? job.eligibleBranches.join(', ') : 'All'}
                      </p>
                    </div>
                  </div>
                  {job.deadline && (
                    <div className="p-2 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Deadline:</span>
                      <span className="font-bold">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  {!isEligible && (
                    <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100 flex items-center gap-2">
                      <XCircle className="w-3 h-3" /> Not eligible based on profile
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    disabled={!isEligible || hasApplied || isDeadlinePassed}
                    onClick={() => handleApply(job)}
                  >
                    {hasApplied ? "Already Applied" : isDeadlinePassed ? "Deadline Passed" : isEligible ? "Apply Now" : "Ineligible"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile' || isEditingProfile) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Keep your academic details up to date for better job matching.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cgpa">Current CGPA</Label>
                <Input 
                  id="cgpa" 
                  type="number" 
                  step="0.01" 
                  value={profileForm.cgpa} 
                  onChange={(e) => setProfileForm({...profileForm, cgpa: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={profileForm.branch} onValueChange={(v) => setProfileForm({...profileForm, branch: v})}>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">Computer Science</SelectItem>
                    <SelectItem value="ECE">Electronics & Comm.</SelectItem>
                    <SelectItem value="ME">Mechanical Eng.</SelectItem>
                    <SelectItem value="CE">Civil Eng.</SelectItem>
                    <SelectItem value="EE">Electrical Eng.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input 
                id="skills" 
                placeholder="React, Python, SQL..." 
                value={profileForm.skills}
                onChange={(e) => setProfileForm({...profileForm, skills: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume (PDF only)</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="resume" 
                  type="file" 
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {isUploading && <span className="text-xs text-muted-foreground animate-pulse">Uploading...</span>}
              </div>
              {profileForm.resumeUrl && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Resume uploaded: {profileForm.resumeUrl.split('/').pop()}
                </p>
              )}
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

  return null;
};

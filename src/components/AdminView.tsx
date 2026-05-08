import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { JobDrive, Application, UserProfile } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, CheckCircle2, TrendingUp, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export const AdminView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes, usersRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/applications'),
        fetch('/api/users')
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (appsRes.ok) setApplications(await appsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("User deleted successfully");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleUpdateUser = async () => {
    if (!editForm) return;
    try {
      const res = await fetch(`/api/admin/users/${editForm.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editForm.displayName,
          role: editForm.role,
          email: editForm.email,
          profile: editForm.profile
        })
      });
      if (res.ok) {
        toast.success("User updated successfully");
        setEditingUser(null);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update user");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (activeTab === 'dashboard') {
    const statusData = [
      { name: 'Applied', value: applications.filter(a => a.status === 'applied').length },
      { name: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length },
      { name: 'Selected', value: applications.filter(a => a.status === 'selected').length },
      { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length },
    ];

    const branchData = [
      { name: 'CSE', count: users.filter(u => u.role === 'student' && u.profile?.branch === 'CSE').length },
      { name: 'ECE', count: users.filter(u => u.role === 'student' && u.profile?.branch === 'ECE').length },
      { name: 'ME', count: users.filter(u => u.role === 'student' && u.profile?.branch === 'ME').length },
      { name: 'CE', count: users.filter(u => u.role === 'student' && u.profile?.branch === 'CE').length },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Placement Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of campus placement performance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Students</CardDescription>
              <CardTitle className="text-2xl">{users.filter(u => u.role === 'student').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Recruiters</CardDescription>
              <CardTitle className="text-2xl">{users.filter(u => u.role === 'recruiter').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Drives</CardDescription>
              <CardTitle className="text-2xl">{jobs.filter(j => j.status === 'active').length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Placed</CardDescription>
              <CardTitle className="text-2xl text-green-600">{applications.filter(a => a.status === 'selected').length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs">
                {statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment by Branch</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeTab === 'manage-jobs') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Manage Placement Drives</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Drive Title</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Min CGPA</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.companyName}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{job.minCGPA}</TableCell>
                    <TableCell>{applications.filter(a => a.jobId === job.id).length}</TableCell>
                    <TableCell>
                      <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
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

  if (activeTab === 'manage-users') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-medium">{u.displayName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {u.role === 'student' ? `${u.profile?.branch || 'N/A'} | ${u.profile?.cgpa || 'N/A'}` : u.profile?.companyName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditingUser(u);
                            setEditForm({ ...u });
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(u.uid)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Details</DialogTitle>
              <DialogDescription>Update the account information and role for this user.</DialogDescription>
            </DialogHeader>
            {editForm && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input 
                    id="edit-name" 
                    value={editForm.displayName} 
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input 
                    id="edit-email" 
                    value={editForm.email} 
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(val: any) => setEditForm({ ...editForm, role: val })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold mb-2">Profile Details</p>
                  {editForm.role === 'recruiter' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-company">Company Name</Label>
                      <Input 
                        id="edit-company" 
                        value={editForm.profile?.companyName || ''} 
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          profile: { ...editForm.profile, companyName: e.target.value } 
                        })} 
                      />
                    </div>
                  )}
                  {editForm.role === 'student' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-branch">Branch</Label>
                        <Input 
                          id="edit-branch" 
                          value={editForm.profile?.branch || ''} 
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            profile: { ...editForm.profile, branch: e.target.value } 
                          })} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-cgpa">CGPA</Label>
                        <Input 
                          id="edit-cgpa" 
                          type="number"
                          step="0.01"
                          value={editForm.profile?.cgpa || 0} 
                          onChange={(e) => setEditForm({ 
                            ...editForm, 
                            profile: { ...editForm.profile, cgpa: Number(e.target.value) } 
                          })} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (activeTab === 'reports') {
    const selectedApps = applications.filter(a => a.status === 'selected');
    
    return (
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Placement Reports</h1>
            <p className="text-muted-foreground">Detailed reports on placement activities and success rates.</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <TrendingUp className="w-4 h-4" /> Export PDF
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Selection Rate</CardDescription>
              <CardTitle className="text-2xl">
                {applications.length > 0 
                  ? ((selectedApps.length / applications.length) * 100).toFixed(1) 
                  : 0}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Shortlisted</CardDescription>
              <CardTitle className="text-2xl">
                {applications.filter(a => a.status === 'shortlisted').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average CGPA (Selected)</CardDescription>
              <CardTitle className="text-2xl">
                {selectedApps.length > 0 
                  ? (selectedApps.reduce((acc, curr) => acc + curr.studentCGPA, 0) / selectedApps.length).toFixed(2)
                  : 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selected Students List</CardTitle>
            <CardDescription>All students who have successfully secured placements.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>CGPA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedApps.length > 0 ? (
                  selectedApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.studentName}</TableCell>
                      <TableCell>{users.find(u => u.email === app.studentEmail)?.profile?.branch || 'N/A'}</TableCell>
                      <TableCell>{app.companyName || 'N/A'}</TableCell>
                      <TableCell>{app.jobTitle || 'N/A'}</TableCell>
                      <TableCell>{app.studentCGPA}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No placements recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

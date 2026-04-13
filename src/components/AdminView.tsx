import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { JobDrive, Application, UserProfile } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, CheckCircle2, TrendingUp } from 'lucide-react';

export const AdminView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

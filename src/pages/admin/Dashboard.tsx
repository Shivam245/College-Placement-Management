import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { JobDrive, Application, UserProfile } from '../../types';

interface DashboardProps {
  jobs: JobDrive[];
  applications: Application[];
  users: UserProfile[];
}

export const Dashboard: React.FC<DashboardProps> = ({ jobs, applications, users }) => {
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
};

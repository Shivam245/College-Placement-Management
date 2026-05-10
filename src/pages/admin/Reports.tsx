import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { TrendingUp } from 'lucide-react';
import { Application, UserProfile, JobDrive } from '../../types';

interface ReportsProps {
  applications: Application[];
  users: UserProfile[];
  jobs: JobDrive[];
}

export const Reports: React.FC<ReportsProps> = ({ applications, users, jobs }) => {
  const selectedApps = applications.filter(a => a.status === 'selected');
  const shortlistedAppsCount = applications.filter(a => a.status === 'shortlisted').length;
  
  const averageCGPA = selectedApps.length > 0 
    ? (selectedApps.reduce((acc, curr) => acc + curr.studentCGPA, 0) / selectedApps.length).toFixed(2)
    : 'N/A';
    
  const selectionRate = applications.length > 0 
    ? ((selectedApps.length / applications.length) * 100).toFixed(1) 
    : 0;

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
            <CardTitle className="text-2xl">{selectionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Shortlisted</CardDescription>
            <CardTitle className="text-2xl">{shortlistedAppsCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average CGPA (Selected)</CardDescription>
            <CardTitle className="text-2xl">{averageCGPA}</CardTitle>
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
                    <TableCell>
                      {users.find(u => u.email === app.studentEmail)?.profile?.branch || 'N/A'}
                    </TableCell>
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
};

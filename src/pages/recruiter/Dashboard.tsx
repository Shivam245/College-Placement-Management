import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Users, Briefcase, CheckCircle2, BriefcaseBusiness } from 'lucide-react';
import { JobDrive, Application, UserProfile } from '../../types';

interface DashboardProps {
  jobs: JobDrive[];
  applications: Application[];
  userProfile: UserProfile | null;
  onUpdateStatus: (appId: string, status: any) => void;
  onEditProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  jobs, 
  applications, 
  userProfile, 
  onUpdateStatus,
  onEditProfile
}) => {
  const activeDrives = jobs.filter(j => j.status === 'active');
  const selectedApps = applications.filter(a => a.status === 'selected');

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your placement drives and candidates.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Active Drives
            </CardDescription>
            <CardTitle className="text-2xl">{activeDrives.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Total Applicants
            </CardDescription>
            <CardTitle className="text-2xl">{applications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-500">
              <CheckCircle2 className="w-4 h-4" /> Selected
            </CardDescription>
            <CardTitle className="text-2xl">{selectedApps.length}</CardTitle>
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
                {applications.slice(0, 5).map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.studentName}</p>
                        <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell>{app.studentCGPA}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'selected' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onUpdateStatus(app.id, 'shortlisted')}>
                          Shortlist
                        </Button>
                        <Button size="sm" variant="default" onClick={() => onUpdateStatus(app.id, 'selected')}>
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
            <Button variant="outline" className="w-full" onClick={onEditProfile}>
              Edit Company Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

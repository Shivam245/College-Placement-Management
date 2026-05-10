import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Clock, Filter, CheckCircle2, XCircle, User, BookOpen, Award, FileText } from 'lucide-react';
import { Application, UserProfile } from '../../types';

interface DashboardProps {
  userProfile: UserProfile | null;
  applications: Application[];
  onEditProfile: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userProfile, applications, onEditProfile }) => {
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
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>{app.jobTitle}</TableCell>
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
            <Button variant="outline" className="w-full" onClick={onEditProfile}>
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

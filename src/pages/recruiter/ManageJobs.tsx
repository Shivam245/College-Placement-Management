import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, XCircle } from 'lucide-react';
import { JobDrive, Application } from '../../types';

interface ManageJobsProps {
  jobs: JobDrive[];
  applications: Application[];
  onCreateClick: () => void;
  onToggleStatus: (jobId: string, status: 'active' | 'closed') => void;
  onDelete: (jobId: string) => void;
}

export const ManageJobs: React.FC<ManageJobsProps> = ({ 
  jobs, 
  applications, 
  onCreateClick, 
  onToggleStatus, 
  onDelete 
}) => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Placement Drives</h1>
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" /> Create New
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
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
                <span className="font-medium">{applications.filter(a => a.jobId === job.id).length}</span>
              </div>
              {job.deadline && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium text-red-500">{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onToggleStatus(job.id, job.status)}>
                {job.status === 'active' ? 'Close Drive' : 'Open Drive'}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(job.id)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

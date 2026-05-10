import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Search, Clock, XCircle } from 'lucide-react';
import { JobDrive, Application, UserProfile } from '../../types';

interface JobPortalProps {
  jobs: JobDrive[];
  applications: Application[];
  userProfile: UserProfile | null;
  onApply: (job: JobDrive) => void;
}

export const JobPortal: React.FC<JobPortalProps> = ({ jobs, applications, userProfile, onApply }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
                  onClick={() => onApply(job)}
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
};

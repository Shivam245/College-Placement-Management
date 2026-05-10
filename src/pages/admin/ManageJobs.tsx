import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { JobDrive, Application } from '../../types';

interface ManageJobsProps {
  jobs: JobDrive[];
  applications: Application[];
}

export const ManageJobs: React.FC<ManageJobsProps> = ({ jobs, applications }) => {
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
};

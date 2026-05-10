import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Application } from '../../types';

interface ApplicantsProps {
  applications: Application[];
  onUpdateStatus: (appId: string, status: any) => void;
}

export const Applicants: React.FC<ApplicantsProps> = ({ applications, onUpdateStatus }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Applicant Management</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Drive</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
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
                    {app.resumeUrl ? (
                      <a 
                        href={app.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" /> View Resume
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">No Resume</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'selected' ? 'default' : app.status === 'rejected' ? 'destructive' : 'outline'}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => onUpdateStatus(app.id, 'shortlisted')}>Shortlist</Button>
                      <Button size="sm" variant="default" onClick={() => onUpdateStatus(app.id, 'selected')}>Select</Button>
                      <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(app.id, 'rejected')}>Reject</Button>
                    </div>
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

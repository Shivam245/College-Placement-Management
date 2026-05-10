import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { FileText } from 'lucide-react';
import { Application } from '../../types';

interface ApplicationsProps {
  applications: Application[];
  onRefresh: () => void;
}

export const Applications: React.FC<ApplicationsProps> = ({ applications, onRefresh }) => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground">Detailed history and status of all your job drive applications.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>Track the real-time status of your submissions.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No applications submitted yet.</p>
              <Button variant="outline" className="mt-4" onClick={onRefresh}>Refresh</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-semibold">{app.companyName}</TableCell>
                    <TableCell>{app.jobTitle}</TableCell>
                    <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        app.status === 'selected' ? 'default' : 
                        app.status === 'rejected' ? 'destructive' : 
                        app.status === 'shortlisted' ? 'secondary' : 'outline'
                      }>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.resumeUrl ? (
                        <a 
                          href={app.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          <FileText className="w-3 h-3 mr-1" /> View PDF
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Resume</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

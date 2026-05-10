import { api } from './api';
import { JobDrive, Application } from '../types';

export const jobService = {
  async getJobs(): Promise<JobDrive[]> {
    return api.get('/api/jobs');
  },

  async createJob(jobData: Partial<JobDrive>): Promise<JobDrive> {
    return api.post('/api/jobs', jobData);
  },

  async updateJobStatus(jobId: string, status: 'active' | 'closed'): Promise<{ success: boolean }> {
    return api.patch(`/api/jobs/${jobId}`, { status });
  },

  async deleteJob(jobId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/jobs/${jobId}`);
  },

  async getApplications(): Promise<Application[]> {
    return api.get('/api/applications');
  },

  async applyForJob(applicationData: any): Promise<Application> {
    return api.post('/api/applications', applicationData);
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<{ success: boolean }> {
    return api.patch(`/api/applications/${applicationId}`, { status });
  },

  async uploadResume(formData: FormData): Promise<{ resumeUrl: string }> {
    return api.upload('/api/upload/resume', formData);
  }
};

import { useState, useCallback, useEffect } from 'react';
import { jobService } from '../services/jobs';
import { JobDrive } from '../types';
import { toast } from 'sonner';

export const useJobs = () => {
  const [jobs, setJobs] = useState<JobDrive[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = async (jobData: Partial<JobDrive>) => {
    try {
      await jobService.createJob(jobData);
      toast.success("Job drive created successfully!");
      fetchJobs();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create job drive");
      return false;
    }
  };

  const toggleJobStatus = async (jobId: string, currentStatus: 'active' | 'closed') => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await jobService.updateJobStatus(jobId, newStatus);
      toast.success(`Job drive ${newStatus === 'active' ? 'activated' : 'closed'} successfully`);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to update job status");
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      await jobService.deleteJob(jobId);
      toast.success("Job drive deleted successfully");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job drive");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, fetchJobs, createJob, toggleJobStatus, deleteJob };
};

import { useState, useCallback, useEffect } from 'react';
import { jobService } from '../services/jobs';
import { Application } from '../types';
import { toast } from 'sonner';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobService.getApplications();
      setApplications(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToJob = async (applicationData: any) => {
    try {
      await jobService.applyForJob(applicationData);
      toast.success("Application submitted successfully!");
      fetchApplications();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to apply");
      return false;
    }
  };

  const updateStatus = async (applicationId: string, status: string) => {
    try {
      await jobService.updateApplicationStatus(applicationId, status);
      toast.success(`Status updated to ${status}`);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return { applications, loading, fetchApplications, applyToJob, updateStatus };
};

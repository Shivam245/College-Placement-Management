import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import { userService } from '../services/users';
import { JobDrive } from '../types';
import { toast } from 'sonner';
import { Dashboard } from './student/Dashboard';
import { JobPortal } from './student/JobPortal';
import { Applications } from './student/Applications';
import { Profile } from './student/Profile';

interface StudentPageProps {
  activeTab: string;
}

export const StudentPage: React.FC<StudentPageProps> = ({ activeTab }) => {
  const { userProfile, refreshProfile } = useAuth();
  const { jobs } = useJobs();
  const { applications, applyToJob, fetchApplications } = useApplications();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleApply = async (job: JobDrive) => {
    if (!userProfile?.profile?.cgpa || !userProfile?.profile?.branch) {
      toast.error("Please complete your profile (CGPA & Branch) before applying.");
      return;
    }

    if (userProfile.profile.cgpa < job.minCGPA) {
      toast.error("You do not meet the minimum CGPA requirement for this drive.");
      return;
    }

    if (job.eligibleBranches.length > 0 && !job.eligibleBranches.includes(userProfile.profile.branch)) {
      toast.error("Your branch is not eligible for this drive.");
      return;
    }

    const alreadyApplied = applications.some(app => app.jobId === job.id);
    if (alreadyApplied) {
      toast.error("You have already applied for this drive.");
      return;
    }

    await applyToJob({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      studentName: userProfile.displayName,
      studentEmail: userProfile.email,
      studentCGPA: userProfile.profile.cgpa,
      resumeUrl: userProfile.profile.resumeUrl || ''
    });
  };

  const handleUpdateMyProfile = async (data: any) => {
    try {
      await userService.updateMyProfile(data);
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  const renderContent = () => {
    if (isEditingProfile || activeTab === 'profile') {
      return (
        <Profile 
          userProfile={userProfile} 
          onUpdate={handleUpdateMyProfile} 
          onCancel={() => setIsEditingProfile(false)} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile} 
            applications={applications} 
            onEditProfile={() => setIsEditingProfile(true)} 
          />
        );
      case 'jobs':
        return (
          <JobPortal 
            jobs={jobs} 
            applications={applications} 
            userProfile={userProfile} 
            onApply={handleApply} 
          />
        );
      case 'applications':
        return <Applications applications={applications} onRefresh={fetchApplications} />;
      default:
        return null;
    }
  };

  return <div className="h-full">{renderContent()}</div>;
};

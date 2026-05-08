export type UserRole = 'student' | 'recruiter' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  profile?: {
    cgpa?: number;
    branch?: string;
    skills?: string[];
    companyName?: string;
    designation?: string;
  };
  createdAt: string;
}

export interface JobDrive {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  minCGPA: number;
  eligibleBranches: string[];
  deadline?: string;
  status: 'active' | 'closed';
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCGPA: number;
  resumeUrl: string;
  status: 'applied' | 'shortlisted' | 'selected' | 'rejected';
  appliedAt: string;
}

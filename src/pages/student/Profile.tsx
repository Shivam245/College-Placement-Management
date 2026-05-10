import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { jobService } from '../../services/jobs';
import { toast } from 'sonner';

interface ProfileProps {
  userProfile: UserProfile | null;
  onUpdate: (data: any) => void;
  onCancel: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdate, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    cgpa: userProfile?.profile?.cgpa || 0,
    branch: userProfile?.profile?.branch || '',
    skills: userProfile?.profile?.skills?.join(', ') || '',
    resumeUrl: userProfile?.profile?.resumeUrl || ''
  });

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file.");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('resume', file);

    setIsUploading(true);
    try {
      const data = await jobService.uploadResume(uploadData);
      setFormData(prev => ({ ...prev, resumeUrl: data.resumeUrl }));
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onUpdate({
      displayName: formData.displayName,
      profile: {
        cgpa: Number(formData.cgpa),
        branch: formData.branch,
        skills: formData.skills.split(',').map(s => s.trim()),
        resumeUrl: formData.resumeUrl
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Keep your academic details up to date for better job matching.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Account & Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input 
              id="fullName" 
              placeholder="Enter your full name" 
              value={formData.displayName} 
              onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cgpa">Current CGPA</Label>
              <Input 
                id="cgpa" 
                type="number" 
                step="0.01" 
                value={formData.cgpa} 
                onChange={(e) => setFormData({...formData, cgpa: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={formData.branch} onValueChange={(v) => setFormData({...formData, branch: v})}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">Computer Science</SelectItem>
                  <SelectItem value="ECE">Electronics & Comm.</SelectItem>
                  <SelectItem value="ME">Mechanical Eng.</SelectItem>
                  <SelectItem value="CE">Civil Eng.</SelectItem>
                  <SelectItem value="EE">Electrical Eng.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma separated)</Label>
            <Input 
              id="skills" 
              placeholder="React, Python, SQL..." 
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF only)</Label>
            <div className="flex items-center gap-4">
              <Input 
                id="resume" 
                type="file" 
                accept=".pdf"
                onChange={handleResumeUpload}
                disabled={isUploading}
                className="cursor-pointer"
              />
              {isUploading && <span className="text-xs text-muted-foreground animate-pulse">Uploading...</span>}
            </div>
            {formData.resumeUrl && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resume uploaded: {formData.resumeUrl.split('/').pop()}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button className="flex-1" onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

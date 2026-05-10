import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { UserProfile } from '../../types';

interface ProfileProps {
  userProfile: UserProfile | null;
  onUpdate: (data: any) => void;
  onCancel: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    companyName: userProfile?.profile?.companyName || '',
    designation: userProfile?.profile?.designation || '',
    displayName: userProfile?.displayName || ''
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information and recruiter details.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Full Name</Label>
            <Input 
              id="displayName" 
              value={formData.displayName} 
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground italic">Name can only be changed by admin.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName" 
                placeholder="Google, Microsoft, etc." 
                value={formData.companyName} 
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input 
                id="designation" 
                placeholder="HR Manager, Tech Lead, etc." 
                value={formData.designation} 
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button className="flex-1" onClick={() => onUpdate({ profile: { companyName: formData.companyName, designation: formData.designation } })}>
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

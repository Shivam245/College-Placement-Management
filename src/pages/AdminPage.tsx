import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { useApplications } from '../hooks/useApplications';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { UserProfile } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dashboard } from './admin/Dashboard';
import { ManageJobs } from './admin/ManageJobs';
import { ManageUsers } from './admin/ManageUsers';
import { Reports } from './admin/Reports';

interface AdminPageProps {
  activeTab: string;
}

export const AdminPage: React.FC<AdminPageProps> = ({ activeTab }) => {
  const { jobs } = useJobs();
  const { applications } = useApplications();
  const { users, updateUser, deleteUser } = useAdminUsers();
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({ ...user });
  };

  const handleSaveUser = async () => {
    if (!editForm) return;
    const success = await updateUser(editForm.uid, {
      displayName: editForm.displayName,
      role: editForm.role,
      email: editForm.email,
      profile: editForm.profile
    });
    if (success) setEditingUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard jobs={jobs} applications={applications} users={users} />;
      case 'manage-jobs':
        return <ManageJobs jobs={jobs} applications={applications} />;
      case 'manage-users':
        return <ManageUsers users={users} onEdit={handleEditClick} onDelete={deleteUser} />;
      case 'reports':
        return <Reports applications={applications} users={users} jobs={jobs} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      {renderContent()}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>Update the account information and role for this user.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input 
                  id="edit-name" 
                  value={editForm.displayName} 
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input 
                  id="edit-email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={editForm.role} 
                  onValueChange={(val: any) => setEditForm({ ...editForm, role: val })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold mb-2">Profile Details</p>
                {editForm.role === 'recruiter' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company Name</Label>
                    <Input 
                      id="edit-company" 
                      value={editForm.profile?.companyName || ''} 
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        profile: { ...editForm.profile, companyName: e.target.value } 
                      })} 
                    />
                  </div>
                )}
                {editForm.role === 'student' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-branch">Branch</Label>
                      <Input 
                        id="edit-branch" 
                        value={editForm.profile?.branch || ''} 
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          profile: { ...editForm.profile, branch: e.target.value } 
                        })} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-cgpa">CGPA</Label>
                      <Input 
                        id="edit-cgpa" 
                        type="number"
                        step="0.01"
                        value={editForm.profile?.cgpa || 0} 
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          profile: { ...editForm.profile, cgpa: Number(e.target.value) } 
                        })} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

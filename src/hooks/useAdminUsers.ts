import { useState, useCallback, useEffect } from 'react';
import { userService } from '../services/users';
import { UserProfile } from '../types';
import { toast } from 'sonner';

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = async (uid: string, data: Partial<UserProfile>) => {
    try {
      await userService.adminUpdateUser(uid, data);
      toast.success("User updated successfully");
      fetchUsers();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
      return false;
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      await userService.adminDeleteUser(uid);
      toast.success("User deleted successfully");
      fetchUsers();
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, fetchUsers, updateUser, deleteUser };
};

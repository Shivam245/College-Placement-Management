import { api } from './api';
import { UserProfile } from '../types';

export const userService = {
  async updateMyProfile(data: { profile?: any; displayName?: string }): Promise<{ success: boolean }> {
    return api.patch('/api/users/me', data);
  },

  async getAllUsers(): Promise<UserProfile[]> {
    return api.get('/api/users');
  },

  async adminUpdateUser(uid: string, data: Partial<UserProfile>): Promise<{ success: boolean }> {
    return api.patch(`/api/admin/users/${uid}`, data);
  },

  async adminDeleteUser(uid: string): Promise<{ success: boolean }> {
    return api.delete(`/api/admin/users/${uid}`);
  }
};

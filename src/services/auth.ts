import { api } from './api';
import { UserProfile } from '../types';

export const authService = {
  async getMe(): Promise<UserProfile> {
    return api.get('/api/auth/me');
  },

  async login(credentials: any): Promise<UserProfile> {
    return api.post('/api/auth/login', credentials);
  },

  async signup(data: any): Promise<UserProfile> {
    return api.post('/api/auth/signup', data);
  },

  async logout(): Promise<{ success: boolean }> {
    return api.post('/api/auth/logout', {});
  }
};

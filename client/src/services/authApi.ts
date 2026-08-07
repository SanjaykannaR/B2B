import api from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'client' | 'driver' | 'executive';
    company?: string;
    phone?: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'client' | 'driver' | 'executive';
  company?: string;
  phone?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/auth/me');
  return data;
}

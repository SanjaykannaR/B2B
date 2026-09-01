import { useAppSelector } from '../store/store';
import type { User } from '../services/authApi';

interface UseAuthResult {
  user: User | null;
  role: User['role'] | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export function useAuth(): UseAuthResult {
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    loading,
    error,
  };
}

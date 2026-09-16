// This file is for: Custom hook to access Redux auth state
// Module: Frontend Custom Hooks (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * useAuth Hook
 * Provides an easy interface to read authentication state from the Redux store.
 * @returns object containing user, role, isAuthenticated, and loading state
 */
export const useAuth = () => {
  const authState = useSelector((state: RootState) => state.auth);

  return {
    user: authState.user,
    role: authState.user?.role || null,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
  };
};

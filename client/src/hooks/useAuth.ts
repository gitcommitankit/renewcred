import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useLoginMutation, useLogoutMutation } from '@/store/api/authApi';
import { LoginRequest } from '@/types';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';
import { AUTH_COOKIE_MAX_AGE } from '@/lib/constants';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { admin, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const login = useCallback(
    async (credentials: LoginRequest, callbackUrl?: string | null) => {
      const result = await loginMutation(credentials).unwrap();
      const { admin, accessToken } = result.data;

      dispatch(
        setCredentials({
          admin,
          accessToken,
        })
      );
      window.location.assign(callbackUrl || '/admin/dashboard');
      return result;
    },
    [loginMutation, dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Ignore errors on logout — always clear local state
    } finally {
      dispatch(clearCredentials());
      window.location.assign('/admin/login');
    }
  }, [logoutMutation, dispatch]);

  return {
    admin,
    isAuthenticated,
    isLoading,
    isLoginLoading,
    isLogoutLoading,
    login,
    logout,
  };
}

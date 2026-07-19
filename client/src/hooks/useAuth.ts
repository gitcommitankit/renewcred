import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from './useRedux';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';
import { useLoginMutation, useLogoutMutation } from '../store/api/authApi';
import type { LoginRequest } from '../types';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { admin, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await loginMutation(credentials).unwrap();
      dispatch(
        setCredentials({
          admin: result.data.admin,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      router.push('/admin');
      return result;
    },
    [loginMutation, dispatch, router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Ignore errors on logout — always clear local state
    } finally {
      dispatch(clearCredentials());
      router.push('/admin/login');
    }
  }, [logoutMutation, dispatch, router]);

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

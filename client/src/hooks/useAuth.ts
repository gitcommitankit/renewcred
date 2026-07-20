import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from './useRedux';
import { useLoginMutation, useLogoutMutation } from '@/store/api/authApi';
import { LoginRequest } from '@/types';
import { clearCredentials, setCredentials } from '@/store/slices/authSlice';

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
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('admin', JSON.stringify(admin));
        document.cookie = `accessToken=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      dispatch(
        setCredentials({
          admin,
          accessToken,
        })
      );
      router.push(callbackUrl || '/admin/dashboard');
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('admin');
        document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
      }
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

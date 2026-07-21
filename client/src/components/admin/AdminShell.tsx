'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { useGetMeQuery } from '@/store/api/authApi';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: isReduxLoading } = useAppSelector((s) => s.auth);
  const [isMounted, setIsMounted] = useState(false);

  // Automatically hit the backend to check if our HttpOnly cookies are valid
  const { data: meData, error, isLoading: isQueryLoading } = useGetMeQuery();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // If we get a valid response, set the user as authenticated
    if (meData?.data) {
      dispatch(setCredentials({ admin: meData.data, accessToken: '' }));
    } else if (error) {
      dispatch(clearCredentials());
    }
  }, [meData, error, dispatch]);

  const isLoading = isReduxLoading || isQueryLoading;

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-warm-gray-100">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../hooks/useRedux';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector(
    (s: { auth: { isAuthenticated: boolean; isLoading: boolean } }) => s.auth
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
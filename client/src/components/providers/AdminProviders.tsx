'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';

interface AdminProvidersProps {
  children: React.ReactNode;
}

export default function AdminProviders({ children }: AdminProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}

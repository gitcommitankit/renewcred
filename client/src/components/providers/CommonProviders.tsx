'use client';

import { Toaster } from 'react-hot-toast';

interface CommonProvidersProps {
  children: React.ReactNode;
}

export default function CommonProviders({ children }: CommonProvidersProps) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#e03b2f', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

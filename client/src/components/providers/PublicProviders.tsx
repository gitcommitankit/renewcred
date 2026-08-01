'use client';

interface PublicProvidersProps {
  children: React.ReactNode;
}

export default function PublicProviders({ children }: PublicProvidersProps) {
  // Placeholder for future public-specific client providers (e.g. public analytics, query client, etc.)
  return <>{children}</>;
}

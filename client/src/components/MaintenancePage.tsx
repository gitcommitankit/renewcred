'use client';

import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-warm-gray-100 flex flex-col items-center justify-center p-4 text-charcoal-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-warm-gray-200 p-8 text-center space-y-6 relative overflow-hidden">
        {/* Subtle decorative top border highlight */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-brand-red via-brand-red-dark to-brand-red" />

        {/* Logo */}
        <Logo className="h-8 w-auto mx-auto text-charcoal-900" />

        {/* Main Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
          System Under Maintenance
        </h1>

        {/* Refresh button */}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="w-full"
        >
          Check Status (Refresh Page)
        </Button>

        {/* GitHub fallback message */}
        <p className="text-xs text-charcoal-600 leading-relaxed">
          In the meantime, you can check out the{' '}
          <Link
            href="https://github.com/gitcommitankit/renewcred"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-red! font-medium hover:underline!"
          >
            source code on GitHub
          </Link>{' '}
          and set up the app manually.
        </p>

        {/* Footer text */}
        <p className="text-xs text-charcoal-600">RenewCred Content Management System</p>
      </div>
    </div>
  );
}

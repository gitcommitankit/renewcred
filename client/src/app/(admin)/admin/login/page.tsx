'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isLoginLoading } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin@renewcred.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await login({ email, password });
      toast.success('Welcome back!');
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        'Invalid email or password';
      toast.error(msg);
    }
  };

  const callbackUrl = searchParams.get('callbackUrl');
  void callbackUrl; // used by the auth hook redirect

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-gray-100 px-4">
      <div className="w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 bg-brand-red rounded-xl mb-4">
            <Leaf size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">RenewCred CMS</h1>
          <p className="text-sm text-warm-gray-500 mt-1">Sign in to manage content</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-warm-gray-200 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="admin@renewcred.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pointer-events-auto text-warm-gray-500 hover:text-[#555] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoginLoading}
              className="w-full mt-1"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-warm-gray-500 mt-6">
          RenewCred Content Management System
        </p>
      </div>
    </div>
  );
}

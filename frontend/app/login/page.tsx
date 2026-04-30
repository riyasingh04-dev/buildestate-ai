'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { Mail, Lock, Building2, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.access_token);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Left: Illustration/Branding */}
      <div className="hidden w-1/2 flex-col justify-center bg-primary p-12 text-primary-foreground lg:flex">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-6 text-5xl font-bold leading-tight">
          Find your dream <br />
          space with <span className="text-accent underline underline-offset-8">BuildEstate AI</span>
        </h1>
        <p className="max-w-md text-lg text-white/70">
          The most trusted platform connecting premier builders with discerning buyers worldwide.
        </p>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col justify-center p-8 md:p-12 lg:w-1/2 bg-white">
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h2>
          <p className="mb-8 text-muted-foreground">Please enter your details to sign in.</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link href="/forgot-password" global-id="forgot-password-link" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base shadow-lg shadow-primary/20">
              Sign In
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

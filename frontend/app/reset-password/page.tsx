'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ResetPasswordContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { 
        token, 
        new_password: newPassword 
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-[32px] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mb-2 text-3xl font-bold text-slate-900">Password Reset</h2>
        <p className="mb-8 text-slate-500">Your password has been successfully updated. You can now log in with your new credentials.</p>
        <Link href="/login">
          <Button className="w-full py-4 shadow-lg shadow-primary/20">
            Go to Login
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mb-2 text-3xl font-bold text-slate-900">Create New Password</h2>
      <p className="mb-8 text-slate-500">Choose a strong password to secure your BuildEstate account.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 font-medium">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              disabled={!token}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              disabled={!token}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 font-medium"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button type="submit" isLoading={isLoading} disabled={!token} className="w-full py-4 text-base shadow-xl shadow-primary/20">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center p-20 bg-white rounded-3xl shadow-xl">Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="rounded-[32px] bg-white p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <Link href="/login" className="mb-8 inline-flex items-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
          
          <h2 className="mb-2 text-3xl font-bold text-slate-900">Forgot Password</h2>
          <p className="mb-8 text-slate-500">Enter your email and we'll send you a link to reset your password.</p>

          {message ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-100">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Send className="h-6 w-6" />
              </div>
              <p className="font-bold text-emerald-900 mb-1">Check your email</p>
              <p className="text-sm text-emerald-600 leading-relaxed">{message}</p>
              <Link href="/login">
                <Button className="mt-6 w-full" variant="outline">Return to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base shadow-xl shadow-primary/20">
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

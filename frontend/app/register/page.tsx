'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { Mail, Lock, Building2, UserCircle2, ArrowRight, User, Phone } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user' as 'user' | 'builder'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register', formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-fit min-h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* Left: Branding */}
      <div className="hidden w-5/12 flex-col justify-center bg-primary p-12 text-primary-foreground lg:flex">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-6 text-4xl font-bold leading-tight">
          Join the future of <br />
          Real Estate management
        </h1>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-accent/20 p-1">
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <p className="text-white/70">Connect with pre-verified buyers and builders.</p>
          </div>
          <div className="flex items-start space-x-4">
            <div className="rounded-full bg-accent/20 p-1">
              <div className="h-2 w-2 rounded-full bg-accent" />
            </div>
            <p className="text-white/70">Manage properties and leads in one dashboard.</p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full flex-col justify-center p-8 md:p-12 lg:w-7/12">
        <div className="mx-auto w-full max-w-md py-12">
          <h2 className="mb-2 text-3xl font-bold text-foreground">Create Account</h2>
          <p className="mb-8 text-muted-foreground">Start your journey with BuildEstate AI today.</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground text-foreground">Full Name</label>
              <div className="relative">
                <UserCircle2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full rounded-xl border border-border bg-muted/50 py-3 pl-10 pr-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, role: 'user'})}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${formData.role === 'user' ? 'border-primary bg-primary/5' : 'border-border bg-transparent hover:border-muted-foreground/30'}`}
                >
                  <User className={`mb-2 h-6 w-6 ${formData.role === 'user' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-bold ${formData.role === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>Buyer</span>
                </div>
                <div 
                  onClick={() => setFormData({...formData, role: 'builder'})}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${formData.role === 'builder' ? 'border-primary bg-primary/5' : 'border-border bg-transparent hover:border-muted-foreground/30'}`}
                >
                  <Building2 className={`mb-2 h-6 w-6 ${formData.role === 'builder' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-bold ${formData.role === 'builder' ? 'text-primary' : 'text-muted-foreground'}`}>Builder</span>
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-4 text-base shadow-lg shadow-primary/20">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

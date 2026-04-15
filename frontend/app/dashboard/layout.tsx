'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, PlusCircle, Building2, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Protect route
  React.useEffect(() => {
    if (!user && pathname.startsWith('/dashboard')) {
       // Only redirect if loading is finished and user is definitely null
    }
  }, [user, pathname]);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Properties', href: '/dashboard/properties', icon: Building2 },
    { label: 'Add Property', href: '/dashboard/add-property', icon: PlusCircle },
    { label: 'Leads Received', href: '/dashboard/leads', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 border-r border-border bg-white p-4">
        <div className="flex flex-col h-full">
          <div className="space-y-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-border pt-4">
            <button
              onClick={logout}
              className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-64 w-full p-8 pt-6">
        {children}
      </main>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-500 font-medium">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Builders', href: '/admin/builders', icon: UserCheck },
    { label: 'Properties', href: '/admin/properties', icon: Building2 },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-primary p-2 rounded-xl">
                <ShieldCheck className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">BuildEstate <span className="text-primary">AI</span></span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Admin Panel</p>
          </div>

          <nav className="flex-1 px-4 space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200',
                  pathname === item.href
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-900 truncate">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate">{user.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 transition-all duration-300">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-white/80 backdrop-blur-md px-8 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {navItems.find(i => i.href === pathname)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider">System Online</span>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { Users, Building2, TrendingUp, Handshake, Loader2, ShieldCheck, UserCheck, Activity } from 'lucide-react';
import adminApi from '@/services/adminApi';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const COLORS_PIE = ['#10b981', '#f59e0b', '#f43f5e'];
const COLORS_BAR = ['#6366f1', '#0ea5e9'];



const CustomTooltipPie = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-xl rounded-2xl px-4 py-3">
        <p className="text-sm font-bold text-slate-800">{payload[0].name}</p>
        <p className="text-2xl font-black text-slate-900">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

const CustomTooltipArea = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-xl rounded-2xl px-4 py-3 text-sm">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch platform stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Total Builders', value: stats?.total_builders || 0, icon: Handshake, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { title: 'Total Properties', value: stats?.total_properties || 0, icon: Building2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { title: 'Total Leads', value: stats?.total_leads || 0, icon: TrendingUp, color: 'text-violet-600', bgColor: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 mt-2 font-medium">Real-time pulse of the BuildEstate AI ecosystem.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Chart 1: Property Moderation Status (Donut) */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-50 rounded-2xl">
              <Building2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Property Moderation</h3>
              <p className="text-xs text-slate-400 font-medium">Approval status breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stats?.property_status_breakdown || []}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {(stats?.property_status_breakdown || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS_PIE[index]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
              <Legend
                formatter={(value) => <span className="text-sm font-semibold text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: User vs Builder (Bar Chart) */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-2xl">
              <UserCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">User Distribution</h3>
              <p className="text-xs text-slate-400 font-medium">Buyers vs Builders on platform</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats?.user_role_breakdown || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontWeight: 700, color: '#1e293b' }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {(stats?.user_role_breakdown || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS_BAR[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Platform Activity Trend (Area Chart) */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-50 rounded-2xl">
              <Activity className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Platform Activity Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Monthly leads & property submissions (last 6 months)</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-violet-500"></span>Leads</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-blue-400"></span>Properties</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats?.activity_trend || []} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="propsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 13, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltipArea />} />
            <Area type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#leadsGrad)" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
            <Area type="monotone" dataKey="properties" stroke="#38bdf8" strokeWidth={2.5} fill="url(#propsGrad)" dot={{ r: 4, fill: '#38bdf8', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Security + Quick Stats */}
      <div className="bg-primary rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <ShieldCheck size={180} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">System Health</h3>
          <p className="text-white/70 font-medium">All systems operational. No critical alerts.</p>
        </div>
        <div className="relative z-10 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3.5 rounded-2xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold">API: ONLINE</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3.5 rounded-2xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-bold">Database: HEALTHY</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3.5 rounded-2xl border border-white/10">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-bold">Pending Reviews: {stats?.property_status_breakdown?.[1]?.value || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

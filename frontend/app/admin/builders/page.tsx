'use client';

import React, { useEffect, useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { Loader2, CheckCircle, Ban, Mail, Search } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { cn } from '@/lib/utils';

const BuildersPage = () => {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchBuilders();
  }, []);

  const fetchBuilders = async () => {
    try {
      const response = await adminApi.getBuilders();
      setBuilders(response.data);
    } catch (error) {
      console.error('Failed to fetch builders', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number) => {
    try {
      await adminApi.verifyBuilder(id);
      fetchBuilders();
    } catch (error) {
      console.error('Failed to verify builder', error);
    }
  };

  const filteredBuilders = builders
    .filter((builder) => {
      const matchesSearch = builder.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           builder.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRank = filterRank === 'All' || builder.broker_rank === filterRank;
      return matchesSearch && matchesRank;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.broker_score - a.broker_score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.id - a.id; // newest (assuming higher ID is newer)
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Builder Verification</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage professional credentials and verify seller trust.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search builders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-sm"
            />
          </div>

          <select 
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="All">All Ranks</option>
            <option value="Elite">🌟 Elite</option>
            <option value="Good">👍 Good</option>
            <option value="Average">📊 Average</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="score">Top Scored</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <AdminTable headers={['Builder', 'Broker Rank', 'ML Score', 'Verification Status', 'Actions']}>
        {filteredBuilders.map((builder) => (
          <tr key={builder.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-tight">{builder.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{builder.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              {builder.broker_rank ? (
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm border",
                  builder.broker_rank === 'Elite' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  builder.broker_rank === 'Good' ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                  {builder.broker_rank}
                </div>
              ) : (
                <span className="text-slate-300 text-[11px] font-medium italic">Unranked</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      builder.broker_score >= 8.5 ? "bg-emerald-500" :
                      builder.broker_score >= 6 ? "bg-blue-500" : "bg-slate-400"
                    )}
                    style={{ width: `${builder.broker_score * 10}%` }}
                  />
                </div>
                <span className="text-[13px] font-bold text-slate-700">{builder.broker_score.toFixed(1)}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={builder.is_verified ? 'verified' : 'pending'} />
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {!builder.is_verified && (
                  <button
                    onClick={() => handleVerify(builder.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
                  >
                    <CheckCircle size={14} />
                    Verify
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (builder.is_blocked) await adminApi.unblockUser(builder.id);
                    else await adminApi.blockUser(builder.id);
                    fetchBuilders();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border shadow-sm",
                    builder.is_blocked
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                    : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                  )}
                >
                  <Ban size={14} />
                  {builder.is_blocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </td>
          </tr>
        ))}
        {builders.length === 0 && (
          <tr>
            <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
              No builders found in the platform.
            </td>
          </tr>
        )}
      </AdminTable>
    </div>
  );
};

export default BuildersPage;

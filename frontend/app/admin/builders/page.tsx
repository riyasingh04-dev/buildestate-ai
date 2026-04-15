'use client';

import React, { useEffect, useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { Loader2, CheckCircle, Ban, Mail } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { cn } from '@/lib/utils';

const BuildersPage = () => {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Builder Verification</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage professional credentials and verify seller trust.</p>
      </div>

      <AdminTable headers={['Builder', 'Verification Status', 'Account Status', 'Actions']}>
        {builders.map((builder) => (
          <tr key={builder.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{builder.name}</div>
                  <div className="text-xs text-slate-500 font-medium">{builder.email}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={builder.is_verified ? 'verified' : 'pending'} />
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={builder.is_blocked ? 'blocked' : 'active'} />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                {!builder.is_verified && (
                  <button
                    onClick={() => handleVerify(builder.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                  >
                    <CheckCircle size={14} />
                    Verify Builder
                  </button>
                )}
                <button
                  onClick={async () => {
                    if (builder.is_blocked) await adminApi.unblockUser(builder.id);
                    else await adminApi.blockUser(builder.id);
                    fetchBuilders();
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                    builder.is_blocked
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                    : "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100"
                  )}
                >
                  <Ban size={14} />
                  {builder.is_blocked ? 'Unblock' : 'Block Account'}
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

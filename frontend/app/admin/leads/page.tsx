'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import { Mail, Calendar, Building2, User, Search, Filter, Users, Phone, Loader2 } from 'lucide-react';

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await adminApi.getLeads();
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching leads', error);
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Interest Leads</h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring all potential buyer interactions across the platform.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="rounded-xl border border-slate-200 bg-white px-9 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-64"
            />
          </div>
          <button className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Potential Buyer</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Property</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Message</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Date</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length > 0 ? (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3 border border-blue-100">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">
                            {lead.user?.name || lead.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center mt-1">
                            <Mail className="h-3 w-3 mr-1 text-slate-400" />
                            {lead.user?.email || lead.email || 'No Email'}
                          </div>
                          {(lead.user?.phone || lead.phone) && (
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-slate-400" />
                              {lead.user?.phone || lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center font-semibold text-slate-700">
                        <Building2 className="h-4 w-4 mr-2 text-indigo-500" />
                        {lead.property?.title || 'Deleted Property'}
                      </div>
                      {lead.property?.location && (
                        <div className="text-[10px] text-slate-400 mt-1 ml-6 uppercase tracking-wider font-bold">
                          {lead.property.location}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-500 line-clamp-1 italic max-w-xs transition-all hover:line-clamp-none cursor-help bg-slate-50 p-2 rounded-lg border border-slate-100">
                        "{lead.message || 'No specific message.'}"
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-slate-600 font-medium">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-100 uppercase tracking-tighter">
                        Active Lead
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <Users className="h-16 w-16 text-slate-200 mb-4" />
                       <h3 className="text-xl font-bold text-slate-900">No leads found</h3>
                       <p className="text-slate-500 max-w-xs mx-auto">The platform hasn't generated any interest leads yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadsPage;

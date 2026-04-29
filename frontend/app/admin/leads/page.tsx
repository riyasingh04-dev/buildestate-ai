'use client';

import React, { useState, useEffect } from 'react';
import adminApi from '@/services/adminApi';
import { Mail, Calendar, Building2, User, Search, Filter, Users, Phone, Loader2, Flame, Zap, Snowflake, TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';
import LeadDetailsDrawer from '@/components/admin/LeadDetailsDrawer';

const AdminLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Hot':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600 border border-red-100 uppercase tracking-tighter">
            <Flame className="h-3 w-3 mr-1" /> Hot 🔥
          </span>
        );
      case 'Warm':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-bold text-yellow-600 border border-yellow-100 uppercase tracking-tighter">
            <Zap className="h-3 w-3 mr-1" /> Warm ⚡
          </span>
        );
      case 'Cold':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-100 uppercase tracking-tighter">
            <Snowflake className="h-3 w-3 mr-1" /> Cold ❄
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-100 uppercase tracking-tighter">
            New Lead
          </span>
        );
    }
  };

  const getRecommendedAction = (category: string) => {
    switch (category) {
      case 'Hot': return { text: 'Call immediately', color: 'text-red-700 bg-red-50 border-red-100' };
      case 'Warm': return { text: 'Follow-up', color: 'text-yellow-700 bg-yellow-50 border-yellow-100' };
      case 'Cold': return { text: 'Nurture', color: 'text-blue-700 bg-blue-50 border-blue-100' };
      default: return { text: 'Initial Reach-out', color: 'text-slate-700 bg-slate-50 border-slate-100' };
    }
  };

  const filteredLeads = leads
    .filter((lead: any) => {
      const matchesSearch = 
        (lead.user?.name || lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.property?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterCategory === 'All' || lead.lead_category === filterCategory;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'score') return (b.lead_score || 0) - (a.lead_score || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
            Global Interest Leads
            <TrendingUp className="ml-3 h-6 w-6 text-emerald-500" />
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Monitoring all potential buyer interactions with AI scoring.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-9 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-sm"
            />
          </div>
          
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 outline-none hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="All">All Leads</option>
            <option value="Hot">🔥 Hot Leads</option>
            <option value="Warm">⚡ Warm Leads</option>
            <option value="Cold">❄ Cold Leads</option>
          </select>

          <button 
            onClick={() => setSortBy(sortBy === 'score' ? 'newest' : 'score')}
            className={`flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              sortBy === 'score' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Sort by Score</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Potential Buyer</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Property</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900 text-center">AI Lead Score</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900">Recommended Action</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-900 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead: any) => {
                  const action = getRecommendedAction(lead.lead_category);
                  const scorePercentage = (lead.lead_score || 0) * 100;
                  
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg ${
                            lead.lead_category === 'Hot' ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-200' :
                            lead.lead_category === 'Warm' ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-yellow-200' :
                            lead.lead_category === 'Cold' ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-200' :
                            'bg-slate-400'
                          }`}>
                            <User className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center">
                              {lead.user?.name || lead.name || 'Unknown User'}
                              {lead.converted && <span className="ml-2 text-emerald-500 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">BUYER</span>}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center mt-1">
                              <Mail className="h-3 w-3 mr-1 text-slate-400" />
                              {lead.user?.email || lead.email || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center font-bold text-slate-700">
                          <Building2 className="h-4 w-4 mr-2 text-primary/60" />
                          {lead.property?.title || 'Deleted Property'}
                        </div>
                        {lead.property?.location && (
                          <div className="text-[10px] text-slate-400 mt-1 ml-6 uppercase tracking-wider font-bold">
                            {lead.property.location}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center justify-between w-full mb-2">
                             {getCategoryBadge(lead.lead_category)}
                             <span className="text-xs font-bold text-slate-700">{Math.round(scorePercentage)}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                             <div 
                               className={`h-full transition-all duration-1000 ${
                                 lead.lead_category === 'Hot' ? 'bg-red-500' :
                                 lead.lead_category === 'Warm' ? 'bg-yellow-500' :
                                 lead.lead_category === 'Cold' ? 'bg-blue-500' :
                                 'bg-slate-300'
                               }`}
                               style={{ width: `${scorePercentage}%` }}
                             />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsDrawerOpen(true);
                          }}
                          className={`inline-flex items-center px-4 py-2 rounded-xl border text-xs font-bold transition-all hover:shadow-md active:scale-95 ${action.color}`}
                        >
                          <BarChart3 className="h-3 w-3 mr-2" />
                          View Insights
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-sm text-slate-600 font-bold">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                            Received
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                       <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                          <Users className="h-10 w-10 text-slate-200" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900">No matching leads found</h3>
                       <p className="text-slate-500 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailsDrawer 
        leadId={selectedLeadId}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onConverted={fetchLeads}
      />
    </div>
  );
};

export default AdminLeadsPage;

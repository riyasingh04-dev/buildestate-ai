'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Mail, Calendar, Building2, User, Search, Filter, Users, Phone, Flame, Zap, Snowflake, TrendingUp, Loader2 } from 'lucide-react';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads/');
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            Interest Leads
            <TrendingUp className="ml-3 h-6 w-6 text-emerald-500" />
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage potential buyers with AI-powered conversion scoring.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-border bg-white px-9 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-sm"
            />
          </div>
          
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-muted-foreground outline-none hover:bg-muted transition-all shadow-sm"
          >
            <option value="All">All Leads</option>
            <option value="Hot">🔥 Hot Leads</option>
            <option value="Warm">⚡ Warm Leads</option>
            <option value="Cold">❄ Cold Leads</option>
          </select>

          <button 
            onClick={() => setSortBy(sortBy === 'score' ? 'newest' : 'score')}
            className={`flex items-center space-x-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all shadow-sm ${
              sortBy === 'score' ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            <span>Sort by Score</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-border shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-8 py-5 text-sm font-bold text-foreground">Potential Buyer</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Property</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground text-center">AI Lead Score</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Recommended Action</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-12 w-48 bg-muted rounded-xl" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-48 bg-muted rounded" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-32 bg-muted rounded-full mx-auto" /></td>
                    <td className="px-8 py-6"><div className="h-8 w-32 bg-muted rounded-xl" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead: any) => {
                  const action = getRecommendedAction(lead.lead_category);
                  const scorePercentage = (lead.lead_score || 0) * 100;

                  return (
                    <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
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
                            <div className="font-bold text-foreground flex items-center">
                              {lead.user?.name || lead.name || 'Unknown User'}
                              {lead.converted && <span className="ml-2 text-emerald-500 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">BUYER</span>}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <Mail className="h-3 w-3 mr-1" />
                              {lead.user?.email || lead.email || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center font-bold text-foreground/80">
                          <Building2 className="h-4 w-4 mr-2 text-primary/60" />
                          {lead.property?.title || 'Unknown Property'}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center justify-center min-w-[120px]">
                          <div className="flex items-center justify-between w-full mb-2">
                             {getCategoryBadge(lead.lead_category)}
                             <span className="text-xs font-bold text-foreground/70">{Math.round(scorePercentage)}%</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border">
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
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl border text-xs font-bold transition-all group-hover:scale-105 ${action.color}`}>
                          {action.text}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-sm text-muted-foreground font-bold">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(lead.created_at).toLocaleDateString()}
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
                       <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                          <Users className="h-10 w-10 text-muted-foreground" />
                       </div>
                       <h3 className="text-xl font-bold">No leads matching your criteria</h3>
                       <p className="text-muted-foreground max-w-xs mx-auto mt-2">Adjust your filters or keep your listings updated to attract more potential buyers.</p>
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

export default LeadsPage;

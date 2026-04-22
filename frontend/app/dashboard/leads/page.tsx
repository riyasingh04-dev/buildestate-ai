'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Mail, Calendar, Building2, User, Search, Filter, Users, Phone } from 'lucide-react';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interest Leads</h1>
          <p className="text-muted-foreground mt-1">Manage potential buyers who showed interest in your properties.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter leads..." 
              className="rounded-lg border border-border bg-white px-9 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-all">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-8 py-5 text-sm font-bold text-foreground">Potential Buyer</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Property Interesed In</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Message</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Received Date</th>
                <th className="px-8 py-5 text-sm font-bold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                [1, 2, 3].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 w-32 bg-muted rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-48 bg-muted rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-12 bg-muted rounded" /></td>
                  </tr>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">
                            {lead.user?.name || lead.name || 'Unknown User'}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                            <Mail className="h-3 w-3 mr-1" />
                            {lead.user?.email || lead.email || 'No Email'}
                          </div>
                          {(lead.user?.phone || lead.phone) && (
                            <div className="text-xs text-muted-foreground flex items-center mt-0.5">
                              <Phone className="h-3 w-3 mr-1" />
                              {lead.user?.phone || lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center font-medium">
                        <Building2 className="h-4 w-4 mr-2 text-accent" />
                        {lead.property?.title || 'Unknown Property'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-muted-foreground line-clamp-1 italic max-w-xs transition-all hover:line-clamp-none">
                        "{lead.message || 'No specific message.'}"
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                        New Lead
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="mb-4 flex flex-col items-center">
                       <Users className="h-12 w-12 text-muted-foreground mb-4" />
                       <h3 className="text-xl font-bold">No leads yet</h3>
                       <p className="text-muted-foreground">Keep your listings active to attract potential buyers.</p>
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

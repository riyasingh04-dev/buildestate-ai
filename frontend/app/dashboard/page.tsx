'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Building2, Users, TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    leads: 0,
    views: 1240 // mock for now
  });

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const propRes = await api.get('/properties/me');
      const myProps = propRes.data;
      
      const leadRes = await api.get('/leads/');
      
      setStats({
        properties: myProps.length,
        leads: leadRes.data.length,
        views: 1240
      });
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    }
  };

  const cards = [
    { title: 'My Properties', value: stats.properties, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Leads', value: stats.leads, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Profile Views', value: stats.views, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your properties today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center">
            <div className={`p-3 rounded-xl ${card.bg} ${card.color} mr-4`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <Link href="/dashboard/add-property" className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-center group">
                <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-3 transition-colors">
                  <Building2 className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-bold text-sm">Add Property</span>
             </Link>
             <Link href="/dashboard/leads" className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition-all text-center group">
                <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-accent/10 flex items-center justify-center mb-3 transition-colors">
                  <Users className="h-6 w-6 text-muted-foreground group-hover:text-accent" />
                </div>
                <span className="font-bold text-sm">View Leads</span>
             </Link>
          </div>
        </div>

        <div className="bg-primary rounded-3xl p-8 text-primary-foreground flex flex-col justify-between overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-10">
            <Building2 size={240} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Premium Growth</h3>
            <p className="text-white/70 mb-8 max-w-sm">
              Your listings are performing 24% better than last month. 
              Increase your exposure by upgrading to a Featured Builder account.
            </p>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Upgrade Account
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Building2, Heart, MapPin, Calendar, ExternalLink, UserCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const UserDashboard = () => {
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyInterests();
  }, []);

  const fetchMyInterests = async () => {
    try {
      const response = await api.get('/leads/my');
      setInterests(response.data);
    } catch (error) {
      console.error('Error fetching user interests', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-border p-8 mb-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <UserCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hello, {user?.name}</h1>
              <p className="text-muted-foreground flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Active Account ({user?.email})
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-muted/30 px-6 py-3 rounded-2xl text-center">
                <div className="text-2xl font-black text-primary">{interests.length}</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Properties Liked</div>
             </div>
             <div className="bg-muted/30 px-6 py-3 rounded-2xl text-center">
                <div className="text-2xl font-black text-primary">0</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inquiries</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Interest List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center">
                <Heart className="mr-2 h-6 w-6 text-red-500 fill-red-500" />
                My Interested Properties
              </h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(n => <div key={n} className="h-40 bg-muted animate-pulse rounded-3xl" />)}
              </div>
            ) : interests.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {interests.map((lead: any) => (
                  <div key={lead.id} className="bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-32 h-32 rounded-2xl bg-muted overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=300`} 
                          alt="Property"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold">{lead.property.title}</h3>
                           <span className="bg-accent/10 text-accent text-[10px] font-bold py-1 px-3 rounded-full uppercase tracking-widest">Sent to Builder</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <MapPin className="mr-1 h-3 w-3 text-accent" />
                          Viewed {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          Expressed interest on {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Link href={`/properties/${lead.property_id}`}>
                          <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            View Listing
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-border p-20 text-center">
                <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">You haven't liked any properties yet</h3>
                <p className="text-muted-foreground mb-8">Start exploring premium properties and mark ones you're interested in.</p>
                <Link href="/">
                  <Button>Explore Properties</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar / Profile Settings Mock */}
          <div className="space-y-8">
            <div className="bg-primary rounded-3xl p-8 text-primary-foreground">
               <h3 className="text-xl font-bold mb-4">BuildEstate AI Gold</h3>
               <p className="text-white/70 text-sm mb-6 leading-relaxed">
                 You are currently on a standard account. Upgrade to get early access to new developments and private viewing slots.
               </p>
               <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                 Explore Membership
               </Button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
               <h3 className="font-bold mb-4 flex items-center">
                 <Building2 className="mr-2 h-4 w-4 text-accent" />
                 Are you a Builder?
               </h3>
               <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                 Switch to a builder account to start listing your own properties and managing leads.
               </p>
               <Button variant="outline" size="sm" className="w-full">Convert Account</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

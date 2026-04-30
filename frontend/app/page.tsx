'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import { Search, MapPin, DollarSign, Filter, Building2, LayoutGrid, Sparkles, ChevronLeft, ChevronRight, TrendingUp, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, getSessionId } = useAuth();
  const [properties, setProperties] = useState([]);
  const [totalProperties, setTotalProperties] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 12;
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [recStrategy, setRecStrategy] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    location: '',
    builder_id: '' as string | number
  });
  const [brokerRankFilter, setBrokerRankFilter] = useState<string>('Elite');

  useEffect(() => {
    fetchProperties(currentPage);
    fetchRecommendations();
    fetchBrokers();
  }, [user, currentPage, filters, brokerRankFilter]);

  const fetchBrokers = async () => {
    setBrokerLoading(true);
    try {
      const url = brokerRankFilter === 'All' 
        ? '/ml/brokers/rankings' 
        : `/ml/brokers/rankings?rank=${brokerRankFilter}`;
      const response = await api.get(url);
      setBrokers(response.data.slice(0, 4)); 
    } catch (error) {
      console.error('Error fetching brokers', error);
    } finally {
      setBrokerLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecsLoading(true);
    try {
      const sessionId = getSessionId();
      // Build query params — send session_id for anonymous, user_id resolved by token on server
      const params = new URLSearchParams();
      if (!user && sessionId) params.append('session_id', sessionId);

      const response = await api.get(`/ml/recommendations?${params.toString()}`);
      const data = response.data;
      setRecStrategy(data.strategy || '');
      setRecommendations(
        (data.recommendations || []).map((r: any) => ({
          id: r.property_id,
          score: r.score,
          source: r.source,
          ...r.metadata,
        }))
      );
    } catch (error) {
      console.error('Error fetching recommendations', error);
    } finally {
      setRecsLoading(false);
    }
  };

  const trackInteraction = async (propertyId: number, action: 'view' | 'click') => {
    try {
      const sessionId = getSessionId();
      await api.post('/ml/interact', {
        property_id: propertyId,
        action,
        // session_id is ignored by backend if user is logged in
        session_id: user ? undefined : sessionId,
      });
    } catch (error) {
      console.error('Failed to track interaction', error);
    }
  };

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    const skip = (page - 1) * propertiesPerPage;
    try {
      const params = new URLSearchParams();
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.location) params.append('location', filters.location);
      if (filters.builder_id) params.append('builder_id', filters.builder_id.toString());
      params.append('skip', skip.toString());
      params.append('limit', propertiesPerPage.toString());

      const response = await api.get(`/properties/?${params.toString()}`);
      setProperties(response.data.properties);
      setTotalProperties(response.data.total);
    } catch (error) {
      console.error('Error fetching properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchProperties(1);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[480px] w-full bg-primary overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent" />
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop" 
            className="h-full w-full object-cover"
            alt="Hero Background"
          />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
              <span className="mr-2 rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase">New</span>
              Explore the latest premium developments
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white lg:text-7xl">
              Elevate Your <br />
              <span className="text-accent italic">Living Standards</span>
            </h1>
            <p className="mb-8 text-xl text-white/80 max-w-xl">
              Discover unique properties from the world's most innovative builders. 
              Modern architecture meets unparalleled comfort.
            </p>

            {/* Floating Search Bar */}
            <form onSubmit={handleSearch} className="flex w-full max-w-4xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl md:flex-row">
              <div className="flex flex-1 items-center px-4 py-2 border-r border-border md:py-0">
                <MapPin className="mr-3 h-5 w-5 text-accent" />
                <input 
                  type="text" 
                  placeholder="Where would you like to live?" 
                  className="w-full bg-transparent outline-none text-foreground font-medium"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                />
              </div>
              <div className="flex items-center px-4 py-2 border-r border-border md:w-32 md:py-0">
                <DollarSign className="mr-2 h-5 w-5 text-accent" />
                <input 
                  type="number" 
                  placeholder="Min Price" 
                  className="w-full bg-transparent outline-none text-foreground font-medium text-sm"
                  value={filters.min_price}
                  onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                />
              </div>
              <div className="flex items-center px-4 py-2 border-r border-border md:w-32 md:py-0">
                <DollarSign className="mr-2 h-5 w-5 text-accent" />
                <input 
                  type="number" 
                  placeholder="Max Price" 
                  className="w-full bg-transparent outline-none text-foreground font-medium text-sm"
                  value={filters.max_price}
                  onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl px-10">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Unified Recommendations Section — shown for ALL users */}
      {recommendations.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4 py-16">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center space-x-2 text-indigo-600 font-bold tracking-widest uppercase text-xs">
                  {recStrategy === 'trending' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {recStrategy === 'trending' && 'Trending Now'}
                    {recStrategy === 'content-based' && 'Based on Your Activity'}
                    {recStrategy === 'hybrid' && 'Personalized for You'}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                  {recStrategy === 'trending' ? 'Popular Properties' : 'Recommended for You'}
                </h2>
                {!user && recStrategy !== 'trending' && (
                  <p className="mt-1 text-sm text-muted-foreground">Browsing anonymously — <a href="/login" className="text-primary underline">log in</a> to unlock full personalization.</p>
                )}
              </div>
              {/* Strategy badge */}
              <span className="hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles className="h-3 w-3" />
                {recStrategy === 'hybrid' ? `Hybrid · ${recsLoading ? '…' : recommendations.length} picks` :
                  recStrategy === 'content-based' ? 'Content-Based' :
                  'Trending'}
              </span>
            </div>

            {recsLoading ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-[400px] w-full animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((prop: any) => (
                  <PropertyCard
                    key={prop.id}
                    {...prop}
                    onInteraction={(action) => trackInteraction(prop.id, action)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Brokers Section */}
      {brokers.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Top Performing Brokers</h2>
            <p className="text-muted-foreground mt-2 font-medium">Expert agents categorized by their property quality standards.</p>
            
            <div className="mt-8 flex justify-center gap-2">
              {['Elite', 'Good', 'Average', 'All'].map((rank) => (
                <button
                  key={rank}
                  onClick={() => setBrokerRankFilter(rank)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
                    brokerRankFilter === rank 
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {rank === 'Elite' ? '🌟 Elite' : 
                   rank === 'Good' ? '👍 Good' : 
                   rank === 'Average' ? '📊 Average' : '🌍 All Brokers'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {brokers.map((broker) => (
              <button 
                key={broker.id} 
                onClick={() => {
                  setFilters(prev => ({ ...prev, builder_id: broker.id }));
                  setCurrentPage(1);
                  // Scroll to listings
                  document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`bg-white border rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all text-center group relative overflow-hidden ${
                  filters.builder_id === broker.id ? 'border-primary ring-2 ring-primary/10' : 'border-slate-100'
                }`}
              >
                {filters.builder_id === broker.id && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                )}
                <div className="relative mb-4 inline-block">
                  <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-inner transition-colors duration-300 ${
                    filters.builder_id === broker.id ? 'bg-primary text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                  }`}>
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 truncate">{broker.name}</h3>
                <div className="mt-1 flex items-center justify-center gap-2">
                   <span className={cn(
                     "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border",
                     broker.rank === 'Elite' ? "bg-amber-50 text-amber-600 border-amber-100" :
                     broker.rank === 'Good' ? "bg-blue-50 text-blue-600 border-blue-100" :
                     "bg-slate-50 text-slate-600 border-slate-100"
                   )}>
                     {broker.rank}
                   </span>
                   <span className="text-slate-400 text-xs font-bold">Score: {broker.score.toFixed(1)}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">View Listings</p>
                   <ChevronRight className={`h-3 w-3 text-slate-300 group-hover:text-primary transition-colors ${filters.builder_id === broker.id ? 'text-primary' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main Content */}
      <section id="listings-section" className="container mx-auto px-4 py-16">
        <div className="mb-12 flex flex-col justify-between items-end gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center space-x-2 text-primary font-bold tracking-widest uppercase text-xs">
              <div className="h-1 w-8 bg-primary" />
              <span>{filters.builder_id ? 'Broker Exclusive' : 'Available Listings'}</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              {filters.builder_id ? (
                <>
                  Listings by <span className="text-primary">{brokers.find(b => b.id === filters.builder_id)?.name || 'Broker'}</span>
                </>
              ) : 'Discover Properties'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {filters.builder_id && (
              <button 
                onClick={() => setFilters(prev => ({ ...prev, builder_id: '' }))}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors mr-4"
              >
                <XCircle className="h-4 w-4" /> Clear Broker Filter
              </button>
            )}
             <div className="flex items-center rounded-lg border border-border bg-muted/30 p-1">
                <button className="rounded-md bg-white p-1.5 shadow-sm text-primary">
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-white/50">
                  <Filter className="h-4 w-4" />
                </button>
             </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[400px] w-full animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((prop: any) => (
                <PropertyCard 
                  key={prop.id} 
                  {...prop} 
                  onInteraction={(action) => trackInteraction(prop.id, action)} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalProperties > propertiesPerPage && (
              <div className="flex items-center justify-center gap-2 md:gap-4">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === 1}
                  className="h-12 w-12 rounded-full flex items-center justify-center border border-border bg-white text-primary hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(totalProperties / propertiesPerPage) }, (_, i) => i + 1)
                    .filter(pageNum => {
                      const totalPages = Math.ceil(totalProperties / propertiesPerPage);
                      // Always show first, last, and 1 page around current
                      return pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1;
                    })
                    .map((pageNum, idx, array) => (
                      <React.Fragment key={pageNum}>
                        {idx > 0 && array[idx - 1] !== pageNum - 1 && (
                          <span className="text-muted-foreground px-1 font-bold">...</span>
                        )}
                        <button
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className={`h-12 w-12 rounded-full font-bold transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110'
                              : 'bg-white text-muted-foreground border border-border hover:border-primary hover:text-primary hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => {
                    const totalPages = Math.ceil(totalProperties / propertiesPerPage);
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === Math.ceil(totalProperties / propertiesPerPage)}
                  className="h-12 w-12 rounded-full flex items-center justify-center border border-border bg-white text-primary hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-foreground">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters to find what you're looking for.</p>
            <Button variant="outline" className="mt-6" onClick={() => setFilters({min_price: '', max_price: '', location: ''})}>
              Reset Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

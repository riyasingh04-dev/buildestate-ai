'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import { Search, MapPin, DollarSign, Filter, Building2, LayoutGrid } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    location: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.location) params.append('location', filters.location);

      const response = await api.get(`/properties/?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
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

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 flex flex-col justify-between items-end gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center space-x-2 text-primary font-bold tracking-widest uppercase text-xs">
              <div className="h-1 w-8 bg-primary" />
              <span>Available Listings</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground">Discover Properties</h2>
          </div>
          
          <div className="flex items-center gap-4">
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop: any) => (
              <PropertyCard key={prop.id} {...prop} />
            ))}
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

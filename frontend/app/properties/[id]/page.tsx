'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { MapPin, DollarSign, Calendar, Heart, Share2, ArrowLeft, Building2, CheckCircle2, Bed, Bath, Maximize, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProperty();
    checkExistingInterest();
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property details', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingInterest = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/leads/check/${id}`);
      if (response.data.is_interested) {
        setIsInterested(true);
      }
    } catch (error) {
      console.error('Error checking existing interest', error);
    }
  };

  const handleInterest = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setInterestLoading(true);
    try {
      await api.post('/leads/', { property_id: parseInt(id as string) });
      setIsInterested(true);
    } catch (error) {
      console.error('Error expressing interest', error);
      alert('Failed to send interest. Please try again.');
    } finally {
      setInterestLoading(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground font-medium">Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold">Property not found</h2>
      <Link href="/" className="mt-4 inline-block text-primary hover:underline">Back to listings</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listings
          </Link>
          <div className="flex items-center space-x-3">
             <Button variant="outline" size="sm"><Share2 className="h-4 w-4" /></Button>
             <Button variant="outline" size="sm"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Placeholder */}
            <div className="overflow-hidden rounded-3xl border border-border shadow-xl ring-1 ring-black/5">
              <img 
                src={property.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"} 
                className="w-full h-[500px] object-cover"
                alt={property.title}
              />
            </div>

            <div className="bg-white rounded-3xl p-8 border border-border">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-foreground mb-4">{property.title}</h1>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center bg-muted/50 px-3 py-1 rounded-full text-sm">
                      <MapPin className="mr-1.5 h-4 w-4 text-accent" />
                      {property.location}
                    </div>
                    <div className="flex items-center bg-muted/50 px-3 py-1 rounded-full text-sm">
                      <Calendar className="mr-1.5 h-4 w-4 text-accent" />
                      Posted {new Date(property.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Price</div>
                  <div className="text-4xl font-black text-primary">${property.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <h3 className="text-xl font-bold mb-4">About this property</h3>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                {[
                  { label: 'Bedrooms', value: property.bedrooms || 0, icon: <Bed className="h-4 w-4" /> },
                  { label: 'Bathrooms', value: property.bathrooms || 0, icon: <Bath className="h-4 w-4" /> },
                  { label: 'Area', value: `${(property.area || 0).toLocaleString()} sqft`, icon: <Maximize className="h-4 w-4" /> },
                  { label: 'Status', value: property.status || 'Available', icon: <FileText className="h-4 w-4" /> }
                ].map((item, idx) => (
                  <div key={idx} className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center text-xs font-bold text-muted-foreground uppercase mb-1">
                      <span className="mr-1.5 opacity-70">{item.icon}</span>
                      {item.label}
                    </div>
                    <div className="text-lg font-bold text-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-border shadow-2xl shadow-primary/5 sticky top-32">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-accent" />
                Interested in this?
              </h3>
              
              <div className="bg-muted/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-bold">Premium Builder</div>
                    <div className="text-xs text-muted-foreground text-foreground">Verified by BuildEstate AI</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  By clicking interest, your contact details will be shared with the builder to arrange a visit.
                </p>
              </div>

              {isInterested ? (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center text-accent font-bold mb-1">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Success!
                  </div>
                  <p className="text-sm text-accent-foreground font-medium">Interest sent to builder.</p>
                </div>
              ) : (
                <Button 
                  onClick={handleInterest} 
                  isLoading={interestLoading} 
                  className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/20"
                >
                  <Heart className={`mr-2 h-5 w-5 ${interestLoading ? 'animate-pulse' : ''}`} />
                  Interested
                </Button>
              )}

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Join 42 others who showed interest in this property this week.
              </p>
            </div>

            <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
               <h4 className="text-xl font-bold mb-4">Want more details?</h4>
               <p className="text-white/70 text-sm mb-6 leading-relaxed">
                 Schedule a private virtual tour or receive a detailed brochure of this development.
               </p>
               <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                 Request PDF Brochure
               </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;

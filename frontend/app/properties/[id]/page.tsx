'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { MapPin, DollarSign, Calendar, Heart, Share2, ArrowLeft, Building2, CheckCircle2, Bed, Bath, Maximize, FileText, Lock, Download, ShoppingCart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import LeadModal from '@/components/LeadModal';
import PaymentModal from '@/components/PaymentModal';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  
  // Modals state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProperty();
    checkExistingInterest();
    if (user && id) {
      trackView();
    }
  }, [id, user]);

  const trackView = async () => {
    try {
      await api.post('/ml/interact', { property_id: parseInt(id as string), action: 'view' });
    } catch (error) {
      console.error('Failed to track view', error);
    }
  };

  const fetchProperty = async () => {
    setLoading(true);
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

  const handleInterestClick = () => {
    if (user) {
      // If logged in, just send interest directly
      sendInterest();
    } else {
      // If not logged in, open anonymous lead modal
      setIsLeadModalOpen(true);
    }
  };

  const sendInterest = async () => {
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

  const handleBuyClick = () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/properties/${id}`);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await api.get(`/properties/${id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `property_report_${id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report', error);
      alert('Failed to download report. Make sure you have purchased the property.');
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

  const isPurchased = property.is_purchased;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Modals */}
      <LeadModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
        propertyId={parseInt(id as string)}
        propertyName={property.title}
        onSuccess={() => {
          setIsInterested(true);
          setIsLeadModalOpen(false);
        }}
      />
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        propertyId={parseInt(id as string)}
        propertyName={property.title}
        price={property.price}
        onSuccess={() => {
          fetchProperty(); // Refresh to get full details
        }}
      />

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
            <div className="relative overflow-hidden rounded-3xl border border-border shadow-xl ring-1 ring-black/5">
              <img 
                src={property.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"} 
                className={`w-full h-[500px] object-cover ${property.is_sold ? 'grayscale-[0.4]' : ''}`}
                alt={property.title}
              />
              {property.is_sold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                   <div className="bg-red-600 text-white px-10 py-4 rounded-full font-black text-5xl tracking-tighter transform -rotate-12 shadow-2xl border-8 border-white animate-pulse">
                    SOLD
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-border relative">
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

              <div className="relative mt-10">
                {!isPurchased && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-md bg-white/40 rounded-2xl border border-white/50 shadow-inner p-6 text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-3 text-primary">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground">Detailed Info Locked</h4>
                    <p className="text-sm text-muted-foreground max-w-xs mb-4">
                      Purchase this property to unlock technical specifications and downloadable documents.
                    </p>
                    <Button onClick={handleBuyClick} variant="primary" size="sm" className="rounded-full px-8">
                       Buy Now to Unlock
                    </Button>
                  </div>
                )}
                
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${!isPurchased ? 'opacity-30 blur-[2px]' : ''}`}>
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

                {isPurchased && (
                  <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="bg-emerald-100 p-2 rounded-lg mr-4 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-900">Property Purchased</div>
                        <div className="text-sm text-emerald-700">You have full access to this listing.</div>
                      </div>
                    </div>
                    <Button onClick={handleDownloadReport} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100 w-full md:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                )}
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
                    <div className="text-xs text-muted-foreground">Verified by BuildEstate AI</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-tight">
                  {user ? "Express your interest directly." : "Share your contact details to arrange a visit."}
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
              ) : property.is_sold ? (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center text-red-600 font-bold mb-1">
                    <Lock className="mr-2 h-5 w-5" />
                    Property Sold
                  </div>
                  <p className="text-xs text-red-500 font-medium">This listing is no longer available.</p>
                </div>
              ) : (
                <Button 
                  onClick={handleInterestClick} 
                  isLoading={interestLoading} 
                  className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/20"
                >
                  <Heart className={`mr-2 h-5 w-5 ${interestLoading ? 'animate-pulse' : ''}`} />
                  Interested
                </Button>
              )}

              <div className="mt-4 border-t border-border pt-4">
                 <Button 
                  onClick={handleBuyClick} 
                  variant={isPurchased ? "outline" : "accent"}
                  disabled={isPurchased || property.is_sold}
                  className="w-full py-4 text-md rounded-2xl"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isPurchased ? "Already Purchased" : property.is_sold ? "Sold Out" : "Buy Property Now"}
                </Button>
              </div>

              <p className="mt-6 text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">
                Built with precision by BuildEstate AI
              </p>
            </div>

            <div className="bg-primary rounded-3xl p-8 text-primary-foreground relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
               <h4 className="text-xl font-bold mb-4">Need Help?</h4>
               <p className="text-white/70 text-sm mb-6 leading-relaxed">
                 Our AI agents are available 24/7 to help you with property evaluation and financial planning.
               </p>
               <Link href="/ai/chat">
                 <Button variant="secondary" className="w-full bg-white text-primary hover:bg-white/90">
                   Chat with Assistant
                 </Button>
               </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;

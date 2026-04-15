'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import { Building2, DollarSign, MapPin, TextQuote, CheckCircle2, Bed, Bath, Maximize, FileText, ImageIcon } from 'lucide-react';

const AddPropertyPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '4',
    bathrooms: '3',
    area: '2500',
    status: 'Available',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.post('/properties/', {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseFloat(formData.area)
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error) {
      console.error('Error adding property', error);
      alert('Failed to add property. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Property Listed!</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">
          Your property has been successfully listed and is now visible to potential buyers.
        </p>
        <div className="flex space-x-4">
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">List New Property</h1>
        <p className="text-muted-foreground mt-1">Provide the details of your property to start collecting leads.</p>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground flex items-center">
           <Building2 className="mr-3 h-6 w-6" />
           <span className="font-bold tracking-tight">Property Details</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Property Title</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                  placeholder="Modern 3-Bedroom Villa with Pool"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Property Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="url"
                  required
                  className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="500,000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all"
                    placeholder="Downtown Los Angeles"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Bedrooms</label>
                <div className="relative">
                  <Bed className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({...formData, bedrooms: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Bathrooms</label>
                <div className="relative">
                  <Bath className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({...formData, bathrooms: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Area (sqft)</label>
                <div className="relative">
                  <Maximize className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    required
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Status</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <select
                    className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-bold appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Offer">Under Offer</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Description</label>
              <div className="relative">
                <TextQuote className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl border border-border bg-muted/30 py-3 pl-10 pr-4 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                  placeholder="Describe the features..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-border">
             <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
             <Button type="submit" isLoading={isLoading} size="lg" className="px-10">List Property</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/services/api';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Building2, DollarSign, MapPin, TextQuote, CheckCircle2, Save, ArrowLeft, Bed, Bath, Maximize, FileText, ImageIcon } from 'lucide-react';

const EditPropertyPage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    status: '',
    image_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      const prop = response.data;
      setFormData({
        title: prop.title,
        description: prop.description,
        price: prop.price.toString(),
        location: prop.location,
        bedrooms: (prop.bedrooms || 0).toString(),
        bathrooms: (prop.bathrooms || 0).toString(),
        area: (prop.area || 0).toString(),
        status: prop.status || 'Available',
        image_url: prop.image_url || ''
      });
    } catch (error) {
      console.error('Error fetching property for edit', error);
      alert('Failed to load property data.');
      router.push('/dashboard/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await api.put(`/properties/${id}`, {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseFloat(formData.area),
        image_url: formData.image_url
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/properties'), 1500);
    } catch (error) {
      console.error('Error updating property', error);
      alert('Failed to update property. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-muted-foreground">Loading property data...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Property</h1>
          <p className="text-muted-foreground mt-1">Update the details of your listing.</p>
        </div>
        <Link href="/dashboard/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-xl shadow-primary/5 overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground flex items-center justify-between">
           <div className="flex items-center">
             <Building2 className="mr-3 h-6 w-6" />
             <span className="font-bold tracking-tight">Modify Listing Details</span>
           </div>
           {success && (
             <div className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Update Successful!
             </div>
           )}
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
             <Button type="button" variant="ghost" onClick={() => router.back()}>Discard Changes</Button>
             <Button type="submit" isLoading={isSaving} size="lg" className="px-10">
               <Save className="mr-2 h-5 w-5" />
               Update Property
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;

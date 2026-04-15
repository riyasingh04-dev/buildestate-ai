'use client';

import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Building2, MapPin, DollarSign, Edit, Trash2, PlusCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const MyPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const response = await api.get('/properties/');
      // Filter by current builder
      const myProps = response.data.filter((p: any) => p.builder_id === user?.id);
      setProperties(myProps);
    } catch (error) {
      console.error('Error fetching my properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      setProperties(properties.filter((p: any) => p.id !== id));
    } catch (error) {
      console.error('Error deleting property', error);
      alert('Failed to delete property.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all your active properties.</p>
        </div>
        <Link href="/dashboard/add-property">
          <Button className="shadow-lg shadow-primary/20">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add New Property
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(n => <div key={n} className="h-64 bg-muted animate-pulse rounded-3xl" />)}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {properties.map((prop: any) => (
            <div key={prop.id} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-xl hover:shadow-primary/5">
              <div className="w-full md:w-48 h-48 bg-muted relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={prop.title}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{prop.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="mr-1 h-3 w-3 text-accent" />
                    {prop.location}
                  </div>
                  <div className="text-2xl font-black text-primary mb-4">${prop.price.toLocaleString()}</div>
                </div>
                
                <div className="flex items-center space-x-3 pt-4 border-t border-border mt-auto">
                   <Link href={`/dashboard/properties/edit/${prop.id}`} className="flex-1">
                     <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                     </Button>
                   </Link>
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(prop.id)}
                   >
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-dashed border-border p-20 text-center">
            <div className="mb-4 flex flex-col items-center">
               <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
               <h3 className="text-2xl font-bold">No properties listed yet</h3>
               <p className="text-muted-foreground mb-8">Start your first listing to begin receiving inquiries.</p>
               <Link href="/dashboard/add-property">
                 <Button>List Your First Property</Button>
               </Link>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyPropertiesPage;

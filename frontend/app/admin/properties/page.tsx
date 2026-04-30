'use client';

import React, { useEffect, useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Loader2, Check, XCircle, Trash2, MapPin, Building2, Search } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { cn } from '@/lib/utils';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<any>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await adminApi.getProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveProperty(id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to approve property', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await adminApi.rejectProperty(id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to reject property', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedProp) return;
    try {
      await adminApi.deleteProperty(selectedProp.id);
      fetchProperties();
    } catch (error) {
      console.error('Failed to delete property', error);
    }
  };

  const filteredProperties = properties
    .filter((prop) => {
      const matchesSearch = prop.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           prop.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || prop.property_category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'score') return b.property_score - a.property_score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Property Moderation</h1>
          <p className="text-slate-500 mt-2 font-medium">Approve quality listings and maintain platform standards.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search properties..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all w-64 shadow-sm"
            />
          </div>

          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="All">All Categories</option>
            <option value="Luxury">✨ Luxury</option>
            <option value="Standard">🏠 Standard</option>
            <option value="Economy">📉 Economy</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 outline-none hover:bg-slate-50 transition-all shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="score">Top Scored</option>
            <option value="price_high">Price: High to Low</option>
            <option value="price_low">Price: Low to High</option>
          </select>
        </div>
      </div>

      <AdminTable headers={['Property', 'Category', 'Quality Score', 'Price', 'Status', 'Actions']}>
        {filteredProperties.map((prop) => (
          <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                  {prop.image_url ? (
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 size={24} />
                    </div>
                  )}
                </div>
                <div className="font-bold text-slate-900 truncate max-w-[180px] leading-tight">{prop.title}</div>
              </div>
            </td>
            <td className="px-6 py-4">
              {prop.property_category ? (
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border",
                  prop.property_category === 'Luxury' ? "bg-amber-50 text-amber-600 border-amber-100" :
                  prop.property_category === 'Standard' ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-slate-50 text-slate-600 border-slate-100"
                )}>
                  {prop.property_category}
                </div>
              ) : (
                <span className="text-slate-300 text-[10px] italic">No Category</span>
              )}
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      prop.property_score >= 8.5 ? "bg-emerald-500" :
                      prop.property_score >= 6 ? "bg-blue-500" : "bg-slate-400"
                    )}
                    style={{ width: `${prop.property_score * 10}%` }}
                  />
                </div>
                <span className="text-[13px] font-bold text-slate-700">{prop.property_score.toFixed(1)}</span>
              </div>
            </td>
            <td className="px-6 py-4 text-slate-600 font-bold text-[13px]">₹{prop.price.toLocaleString()}</td>
            <td className="px-6 py-4">
              {prop.is_sold ? (
                <StatusBadge status="sold" />
              ) : (
                <StatusBadge status={prop.admin_status || 'pending'} />
              )}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                {prop.admin_status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(prop.id)}
                    className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all hover:scale-110 shadow-sm"
                    title="Approve Listing"
                  >
                    <Check size={16} />
                  </button>
                )}
                {prop.admin_status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(prop.id)}
                    className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-all hover:scale-110 shadow-sm"
                    title="Reject Listing"
                  >
                    <XCircle size={16} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedProp(prop);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all hover:scale-110 shadow-sm ml-1"
                  title="Remove Permanently"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {properties.length === 0 && (
          <tr>
            <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium font-sans">
              No property listings found for moderation.
            </td>
          </tr>
        )}
      </AdminTable>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Property"
        message={`Are you sure you want to permanently delete "${selectedProp?.title}"? This listing will be removed from all public searches immediately.`}
      />
    </div>
  );
};

export default AdminPropertiesPage;

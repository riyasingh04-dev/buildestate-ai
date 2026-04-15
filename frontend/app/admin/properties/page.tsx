'use client';

import React, { useEffect, useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Loader2, Check, XCircle, Trash2, MapPin, Building2 } from 'lucide-react';
import adminApi from '@/services/adminApi';

const AdminPropertiesPage = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Property Moderation</h1>
        <p className="text-slate-500 mt-2 font-medium">Approve quality listings and maintain platform standards.</p>
      </div>

      <AdminTable headers={['Property', 'Price', 'Location', 'Mod Status', 'Actions']}>
        {properties.map((prop) => (
          <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {prop.image_url ? (
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 size={24} />
                    </div>
                  )}
                </div>
                <div className="font-bold text-slate-900 truncate max-w-[200px]">{prop.title}</div>
              </div>
            </td>
            <td className="px-6 py-4 text-slate-600 font-bold">₹{prop.price.toLocaleString()}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate max-w-[150px]">{prop.location}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={prop.admin_status || 'pending'} />
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center gap-2">
                {prop.admin_status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(prop.id)}
                    className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 transition-all hover:scale-105"
                    title="Approve Listing"
                  >
                    <Check size={18} />
                  </button>
                )}
                {prop.admin_status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(prop.id)}
                    className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 transition-all hover:scale-105"
                    title="Reject Listing"
                  >
                    <XCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedProp(prop);
                    setIsModalOpen(true);
                  }}
                  className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all hover:scale-105 ml-2"
                  title="Remove Permanently"
                >
                  <Trash2 size={18} />
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

'use client';

import React, { useEffect, useState } from 'react';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Loader2, Trash2, Ban, Unlock } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const UsersPage = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (user: any) => {
    try {
      if (user.is_blocked) {
        await adminApi.unblockUser(user.id);
      } else {
        await adminApi.blockUser(user.id);
      }
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle block status', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminApi.deleteUser(selectedUser.id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
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
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 mt-2 font-medium">Control access and roles for all platform members.</p>
      </div>

      <AdminTable headers={['Name', 'Email', 'Role', 'Status', 'Actions']}>
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-900">{user.name}</td>
            <td className="px-6 py-4 text-slate-600 font-medium">{user.email}</td>
            <td className="px-6 py-4">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                user.role === 'admin' ? "bg-rose-50 text-rose-600 border-rose-100" : 
                user.role === 'builder' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                "bg-slate-100 text-slate-500 border-slate-200"
              )}>
                {user.role}
              </span>
            </td>
            <td className="px-6 py-4">
              <StatusBadge status={user.is_blocked ? 'blocked' : 'active'} />
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBlockToggle(user)}
                  className={cn(
                    "p-2 rounded-xl border transition-all duration-200",
                    user.is_blocked 
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" 
                    : "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100"
                  )}
                  title={user.is_blocked ? 'Unblock' : 'Block'}
                >
                  {user.is_blocked ? <Unlock size={18} /> : <Ban size={18} />}
                </button>
                {user.id !== currentAdmin?.id && (
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl border bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 transition-all duration-200"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone and will remove all their associated data.`}
      />
    </div>
  );
};

export default UsersPage;

import React, { useState } from 'react';
import { X, User, Mail, Phone, Send } from 'lucide-react';
import Button from './ui/Button';
import api from '@/services/api';

interface LeadModalProps {
  propertyId: number;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LeadModal: React.FC<LeadModalProps> = ({ propertyId, propertyName, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/leads/', {
        property_id: propertyId,
        ...formData
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit interest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Interested in this property?</h2>
            <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
              For: {propertyName}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                <input
                  required
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Message (Optional)</label>
              <textarea
                placeholder="I would like to know more about this property..."
                rows={3}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <Button 
              type="submit" 
              isLoading={loading} 
              className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/10 mt-2"
            >
              <Send className="mr-2 h-5 w-5" />
              Send Interest
            </Button>

            <p className="text-[10px] text-center text-muted-foreground mt-4">
              By submitting, you agree to share your details with the property builder.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadModal;

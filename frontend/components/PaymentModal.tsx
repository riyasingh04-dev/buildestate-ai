import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import Button from './ui/Button';
import api from '@/services/api';

interface PaymentModalProps {
  propertyId: number;
  propertyName: string;
  price: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ propertyId, propertyName, price, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/purchases/', {
        property_id: propertyId,
        amount: price
      });
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
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

        {step === 'form' ? (
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Purchase Property</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Completing purchase for {propertyName}
              </p>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 mb-8 border border-primary/10">
              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Amount</div>
              <div className="text-3xl font-black text-primary">${price.toLocaleString()}</div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Card Details</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-accent" />
                  <input
                    required
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <input
                      required
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <input
                      required
                      type="text"
                      placeholder="CVC"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                 </div>
              </div>

              {error && <p className="text-sm text-destructive font-medium">{error}</p>}

              <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure 256-bit SSL Encrypted Payment
              </div>

              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full py-6 text-lg rounded-2xl shadow-lg shadow-primary/10"
              >
                <DollarSign className="mr-2 h-5 w-5" />
                Pay Now
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="mb-6 rounded-full bg-emerald-100 p-6 animate-bounce">
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Congratulations! You now have full access to all property details and documents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

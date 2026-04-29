'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  Activity, 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  MousePointer2,
  PhoneCall,
  ChevronRight,
  ArrowRight,
  Award,
  Zap,
  Flame,
  Snowflake
} from 'lucide-react';
import adminApi from '@/services/adminApi';

interface LeadDetailsDrawerProps {
  leadId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onConverted: () => void;
}

const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({ leadId, isOpen, onClose, onConverted }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (isOpen && leadId) {
      fetchDetails();
    }
  }, [isOpen, leadId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getLeadDetails(leadId!);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching lead details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!leadId) return;
    setConverting(true);
    try {
      await adminApi.convertLead(leadId);
      onConverted();
      onClose();
    } catch (error) {
      console.error('Error converting lead', error);
      alert('Failed to convert lead. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className={`w-screen max-w-xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex h-full flex-col bg-white shadow-2xl rounded-l-[40px] border-l border-slate-100 overflow-hidden">
            
            {/* Header */}
            <div className="px-8 py-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
                   Lead Intelligence
                   <div className="ml-3 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded-md border border-indigo-100 uppercase tracking-widest font-bold">
                     AI Driven
                   </div>
                </h2>
                <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-slate-500 text-sm font-medium">Deep dive into potential buyer behavior and conversion probability.</p>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="relative h-20 w-20">
                   <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
              </div>
            ) : data ? (
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 custom-scrollbar">
                
                {/* Score Section */}
                <section>
                   <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Activity className="h-32 w-32" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center space-x-2">
                              {data.score_details.lead_category === 'Hot' ? <Flame className="h-5 w-5 text-red-400" /> : 
                               data.score_details.lead_category === 'Warm' ? <Zap className="h-5 w-5 text-yellow-400" /> : 
                               <Snowflake className="h-5 w-5 text-blue-400" />}
                              <span className="text-sm font-bold uppercase tracking-[0.2em]">{data.score_details.lead_category} LEAD</span>
                           </div>
                           <div className="text-4xl font-black">{Math.round(data.score_details.conversion_probability * 100)}%</div>
                        </div>

                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-6">
                           <div 
                              className={`h-full transition-all duration-1000 ${
                                 data.score_details.lead_category === 'Hot' ? 'bg-gradient-to-r from-red-500 to-orange-400' :
                                 data.score_details.lead_category === 'Warm' ? 'bg-gradient-to-r from-yellow-400 to-amber-300' :
                                 'bg-gradient-to-r from-blue-500 to-indigo-400'
                              }`}
                              style={{ width: `${data.score_details.conversion_probability * 100}%` }}
                           />
                        </div>

                        <div className="space-y-4">
                           <p className="text-indigo-100/80 text-sm leading-relaxed">
                              {data.score_details.explanation}
                           </p>
                           <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                              <div>
                                 <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Status</div>
                                 <div className="text-xs font-bold">{data.lead.converted ? 'Converted' : 'Active Lead'}</div>
                              </div>
                              <div>
                                 <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Recency</div>
                                 <div className="text-xs font-bold">Updated {new Date(data.lead.created_at).toLocaleDateString()}</div>
                              </div>
                           </div>
                        </div>
                      </div>
                   </div>
                </section>

                {/* Profile Section */}
                <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Buyer Profile</h3>
                   <div className="flex items-start space-x-6">
                      <div className="h-20 w-20 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                         <div className="text-3xl font-black">{data.lead.user?.name?.[0] || data.lead.name?.[0] || '?'}</div>
                      </div>
                      <div className="flex-1 pt-1">
                         <h4 className="text-xl font-bold text-slate-900">{data.lead.user?.name || data.lead.name || 'Anonymous'}</h4>
                         <div className="mt-2 space-y-2">
                            <div className="flex items-center text-sm text-slate-500 font-medium">
                               <Mail className="h-4 w-4 mr-2 text-slate-400" />
                               {data.lead.user?.email || data.lead.email || 'N/A'}
                            </div>
                            <div className="flex items-center text-sm text-slate-500 font-medium">
                               <Phone className="h-4 w-4 mr-2 text-slate-400" />
                               {data.lead.user?.phone || data.lead.phone || 'N/A'}
                            </div>
                         </div>
                      </div>
                   </div>
                </section>

                {/* Property Section */}
                <section className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Interest Summary</h3>
                   <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center">
                         <Building2 className="h-8 w-8 text-slate-300" />
                      </div>
                      <div>
                         <div className="text-sm font-bold text-slate-900">{data.lead.property.title}</div>
                         <div className="text-xs text-slate-500 mt-1 flex items-center">
                            Property ID: #{data.lead.property.id} 
                            <ChevronRight className="h-3 w-3 mx-1" />
                            <span className="text-indigo-600 font-bold">View Listing</span>
                         </div>
                      </div>
                   </div>
                </section>

                {/* Timeline Section */}
                <section>
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Engagement Timeline</h3>
                   <div className="space-y-6">
                      {data.interactions.length > 0 ? (
                        data.interactions.map((interaction: any, idx: number) => (
                           <div key={interaction.id} className="relative pl-8 pb-6 border-l-2 border-slate-100 last:border-0 last:pb-0">
                              <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white ${
                                 interaction.action === 'lead' ? 'bg-red-500' :
                                 interaction.action === 'click' ? 'bg-yellow-500' :
                                 'bg-indigo-500'
                              }`} />
                              <div>
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-slate-900 capitalize">
                                       {interaction.action === 'lead' ? 'Inquiry Sent' : 
                                        interaction.action === 'click' ? 'Clicked Property' : 
                                        'Viewed Property'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">{new Date(interaction.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                                 </div>
                                 <p className="text-xs text-slate-500 leading-relaxed">
                                    Interacted with <span className="font-bold text-slate-700">{interaction.property_title || 'Property'}</span>
                                 </p>
                              </div>
                           </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                           <p className="text-xs text-slate-400 font-medium">No interaction history found for this user.</p>
                        </div>
                      )}
                   </div>
                </section>

                {/* Conversion Action */}
                {!data.lead.converted && (
                   <section className="pt-6 border-t border-slate-100">
                      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                               <Award className="h-6 w-6" />
                            </div>
                            <div>
                               <div className="text-sm font-bold text-emerald-900">Ready to convert?</div>
                               <div className="text-xs text-emerald-600 font-medium">Finalize the purchase now.</div>
                            </div>
                         </div>
                         <button 
                            onClick={handleConvert}
                            disabled={converting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center"
                         >
                            {converting ? 'Processing...' : (
                              <>
                                 Convert to Buyer
                                 <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                         </button>
                      </div>
                   </section>
                )}

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                 <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Unable to load details</h3>
                    <p className="text-slate-500 mt-2">The lead information could not be retrieved at this time.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;

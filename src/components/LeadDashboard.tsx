import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Phone, Home, ChevronRight, Star } from 'lucide-react';
import { Lead } from '../types';

interface LeadDashboardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export function LeadDashboard({ leads, onSelectLead }: LeadDashboardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-bottom border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">
            Live
           </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest">
              <th className="px-6 py-4">Lead Source</th>
              <th className="px-6 py-4">Property</th>
              <th className="px-6 py-4 text-center">Score</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {leads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => onSelectLead(lead)}
                  className="group hover:bg-slate-50 cursor-pointer transition-colors border-b border-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                        <Phone size={14} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 leading-tight">{lead.name}</div>
                        <div className="text-xs text-gray-400 font-mono italic">{lead.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Home size={14} className="text-brand-primary/40" />
                      <span className="text-sm font-medium">{lead.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100">
                      <Star size={12} className={lead.qualificationScore > 70 ? "text-brand-accent fill-brand-accent" : "text-gray-300"} />
                      <span className={`text-sm font-bold ${lead.qualificationScore > 70 ? "text-brand-secondary" : "text-gray-700"}`}>
                        {lead.qualificationScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      lead.status === 'new' ? 'bg-brand-primary/10 text-brand-primary' : 
                      lead.status === 'screened' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 transition-colors" />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

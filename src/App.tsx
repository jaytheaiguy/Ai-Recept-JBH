import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, PhoneCall, Settings, LogOut, Search, Plus, Mail } from 'lucide-react';
import { LeadDashboard } from './components/LeadDashboard';
import { AICallSimulator } from './components/AICallSimulator';
import { StatsGrid } from './components/StatsGrid';
import { Lead, Message, AppStats } from './types';
import { generateLeadSummary, calculateLeadScore } from './lib/gemini';

// Mock data for initial view if Firebase is still provisioning
const INITIAL_STATS: AppStats = {
  totalLeads: 12,
  hotLeads: 4,
  totalCalls: 48
};

const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '(555) 123-4567',
    address: '123 Maple St, Austin, TX',
    condition: 'Needs minor roofing repair',
    askingPrice: '$285,000',
    timeline: '30 days',
    qualificationScore: 88,
    summary: 'Highly motivated seller, relocating for work. House is in good shape overall.',
    transcript: [],
    status: 'new',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Robert Miller',
    phone: '(555) 987-6543',
    address: '456 Oak Ave, Dallas, TX',
    condition: 'Complete fixer upper',
    askingPrice: '$150,000',
    timeline: 'As soon as possible',
    qualificationScore: 94,
    summary: 'Inherited property, wants a quick cash close. Zero sentimentality.',
    transcript: [],
    status: 'screened',
    createdAt: new Date()
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'settings'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [stats, setStats] = useState<AppStats>(INITIAL_STATS);
  const [isProcessingLead, setIsProcessingLead] = useState(false);

  const handleCallComplete = async (transcript: Message[]) => {
    setIsProcessingLead(true);
    setActiveTab('dashboard');

    try {
      const transcriptText = transcript.map(m => `${m.role}: ${m.content}`).join('\n');
      const summary = await generateLeadSummary(transcriptText);
      const score = await calculateLeadScore(summary);

      // Create a new lead from the transcript
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'New Caller', // In a real app index, we'd extract this with AI
        phone: '(555) 000-0000',
        address: 'Processing...',
        condition: 'See summary',
        askingPrice: 'Negotiable',
        timeline: 'Urgent',
        qualificationScore: score,
        summary: summary,
        transcript: transcript,
        status: 'new',
        createdAt: new Date()
      };

      setLeads(prev => [newLead, ...prev]);
      setStats(prev => ({ ...prev, totalLeads: prev.totalLeads + 1, totalCalls: prev.totalCalls + 1 }));

      // Send Email Summary
      await fetch('/api/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'investor@example.com',
          leadData: newLead,
          summary: summary
        })
      });

    } catch (err) {
      console.error("Error processing lead:", err);
    } finally {
      setIsProcessingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <PhoneCall className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fast Fair AI</h1>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'simulator', label: 'AI Receptionist', icon: PhoneCall },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                  ? 'bg-brand-primary/5 text-brand-primary shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
             <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Account</div>
             <div className="text-xs font-semibold text-gray-900 truncate">mayihaveyouremailaddresstoo@gmail.com</div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-red-600 transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-96">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads, properties, or phone numbers..." 
              className="bg-transparent border-none text-sm focus:outline-none w-full text-gray-600"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all uppercase tracking-wide">
              <Plus size={18} />
              Manual Entry
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Investor Dashboard</h1>
                    <p className="text-gray-500">Welcome back. You have 2 new qualified leads waiting.</p>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">Last updated: {new Date().toLocaleTimeString()}</div>
                </div>

                <StatsGrid stats={stats} />
                
                {isProcessingLead && (
                  <div className="mb-6 bg-brand-primary/5 border border-brand-primary/10 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-brand-primary font-mono uppercase tracking-wider">AI is processing new lead...</span>
                  </div>
                )}
                
                <LeadDashboard 
                  leads={leads} 
                  onSelectLead={(l) => console.log(l)} 
                />
              </motion.div>
            )}

            {activeTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto"
              >
                <div className="mb-8 text-center">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Live AI Receptionist</h1>
                  <p className="text-gray-500">Simulate an incoming call to test lead pre-screening.</p>
                </div>
                <AICallSimulator onCallComplete={handleCallComplete} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl"
              >
                 <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuration</h1>
                 <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Notification Settings</h3>
                       <div className="space-y-4">
                          <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Destination Email</label>
                             <div className="flex gap-2">
                                <input 
                                  type="email" 
                                  defaultValue="investor@example.com"
                                  className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                                />
                                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold">Save</button>
                             </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                             <Mail className="text-blue-600 w-5 h-5" />
                             <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                AI summaries will be sent to this email whenever a lead scores above 70.
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                       <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">AI Persona Calibration</h3>
                       <p className="text-sm text-gray-500 mb-4">Adjust how aggressive the AI is in asking for the asking price.</p>
                       <input type="range" className="w-full accent-brand-primary" />
                       <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mt-2">
                          <span>Soft Touch</span>
                          <span>Direct & Firm</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

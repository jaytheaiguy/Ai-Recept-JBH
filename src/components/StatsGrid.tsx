import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { AppStats } from '../types';

interface StatsGridProps {
  stats: AppStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-brand-primary' },
    { label: 'Hot Leads', value: stats.hotLeads, icon: TrendingUp, color: 'text-brand-secondary' },
    { label: 'Active Calls', value: stats.totalCalls, icon: Phone, color: 'text-green-600' },
    { label: 'New Alerts', value: 2, icon: AlertCircle, color: 'text-brand-accent' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {item.label}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{item.value}</div>
        </motion.div>
      ))}
    </div>
  );
}

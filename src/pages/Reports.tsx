import React, { useState, useEffect } from 'react';
import { FileText, Download, PieChart as PieIcon, BarChart as BarIcon, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data));
  }, []);

  const reportTypes = [
    { name: 'Profit & Loss Statement', desc: 'Summary of revenues, costs, and expenses.', icon: BarIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Balance Sheet', desc: 'Financial position at a specific point in time.', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'GST Summary', desc: 'Consolidated tax report for filing returns.', icon: PieIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Cash Flow', desc: 'Movement of cash in and out of the business.', icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reports</h1>
          <p className="text-slate-500 text-sm">Generate and export detailed financial statements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`${report.bg} p-3 rounded-xl`}>
                  <report.icon className={`w-6 h-6 ${report.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{report.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{report.desc}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</div>
            <div className="text-2xl font-bold text-slate-900">₹{stats?.totalRevenue?.toLocaleString() || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tax Collected</div>
            <div className="text-2xl font-bold text-indigo-600">₹{(stats?.totalRevenue * 0.18).toLocaleString() || 0}</div>
            <div className="text-[10px] text-slate-400 italic">*Estimated at 18% avg</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit Margin</div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats?.totalRevenue ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

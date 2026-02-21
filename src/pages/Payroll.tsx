import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Wallet, CreditCard, Download, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Payroll() {
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_name: '', designation: '', basic_salary: 0, allowances: 0, deductions: 0, payment_date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      const res = await api.get('/payroll');
      setPayroll(res.data);
    } catch (err) {
      toast.error('Failed to fetch payroll records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const net_salary = formData.basic_salary + formData.allowances - formData.deductions;
    try {
      await api.post('/payroll', { ...formData, net_salary });
      toast.success('Payroll record added successfully');
      setShowModal(false);
      fetchPayroll();
    } catch (err) {
      toast.error('Failed to add payroll record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="text-slate-500 text-sm">Manage employee salaries and payslips.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Payroll Record
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Employees</div>
          <div className="text-2xl font-bold text-slate-900">{new Set(payroll.map(p => p.employee_name)).size}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Payout (MTD)</div>
          <div className="text-2xl font-bold text-indigo-600">
            ₹{payroll.reduce((acc, p) => acc + p.net_salary, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Payouts</div>
          <div className="text-2xl font-bold text-amber-600">0</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-y border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payroll.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{p.employee_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{p.designation}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(p.payment_date), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] text-slate-500">
                      Basic: ₹{p.basic_salary.toLocaleString()} | 
                      Allow: ₹{p.allowances.toLocaleString()} | 
                      Ded: ₹{p.deductions.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900">
                    ₹{p.net_salary.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Payroll Record</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Employee Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.employee_name}
                    onChange={e => setFormData({...formData, employee_name: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.designation}
                    onChange={e => setFormData({...formData, designation: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Basic Salary</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.basic_salary}
                    onChange={e => setFormData({...formData, basic_salary: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Allowances</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.allowances}
                    onChange={e => setFormData({...formData, allowances: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deductions</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.deductions}
                    onChange={e => setFormData({...formData, deductions: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={formData.payment_date}
                    onChange={e => setFormData({...formData, payment_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

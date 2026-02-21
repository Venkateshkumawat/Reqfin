import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt, ShieldCheck, Zap, BarChart3, 
  ArrowRight, CheckCircle2, Globe, Users, 
  Layout, Package, TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">Req<span className="text-indigo-600">Fin</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Solutions</a>
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full -z-10"></div>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold mb-8 animate-fade-in tracking-wider uppercase">
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>By Requin Solutions Private Limited</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600">Finance is Here.</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            ReqFin empowers modern enterprises with intelligent GST billing, automated payroll, and deep financial insights. Precision-engineered for excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group">
              Launch Platform
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all">
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Enterprise-grade tools <br/> for every business.</h2>
              <p className="text-slate-400 text-lg">We've distilled complex financial workflows into a seamless, high-performance experience.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                <div className="text-3xl font-bold text-indigo-400">99.9%</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">Uptime</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/50">
                <div className="text-3xl font-bold text-emerald-400">100%</div>
                <div className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">GST Ready</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'GST Intelligence', desc: 'Advanced tax engine supporting all Indian GST slabs with real-time validation.', icon: Receipt, color: 'text-indigo-400' },
              { title: 'Asset Management', desc: 'Granular inventory tracking with predictive low-stock alerts and SKU analytics.', icon: Package, color: 'text-emerald-400' },
              { title: 'Payroll Engine', desc: 'Automated salary disbursement with custom allowance and deduction logic.', icon: Users, color: 'text-violet-400' },
              { title: 'Burn Analytics', desc: 'Deep-dive expense reporting to optimize your operational overheads.', icon: TrendingUp, color: 'text-rose-400' },
              { title: 'Global Reporting', desc: 'Instant generation of P&L, Balance Sheets, and audit-ready GST summaries.', icon: BarChart3, color: 'text-amber-400' },
              { title: 'Secure Vault', desc: 'Bank-grade encryption and role-based access control for your financial data.', icon: ShieldCheck, color: 'text-blue-400' },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 p-8 rounded-[2rem] border border-slate-700/50 hover:bg-slate-800 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-700 text-white mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-6">
                <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">ReqFin</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                ReqFin is a product of Requin Solutions Private Limited. We build the infrastructure for the next generation of Indian enterprises.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">GST Billing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Payroll Management</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Inventory Control</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Expense Tracking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About Requin</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Sales</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-400 text-xs font-medium">
              © 2024 Requin Solutions Private Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>ISO 27001 Certified</span>
              <span>•</span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

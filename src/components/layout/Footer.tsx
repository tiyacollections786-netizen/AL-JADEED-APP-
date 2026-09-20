import React from 'react';
import { Egg, ShieldCheck, Mail, Phone, MapPin, Award, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <Egg className="w-6 h-6 fill-amber-100/30 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block font-display">
                  Meta<span className="text-amber-500">Eggs</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 block">
                  Agrotech Layer Platforms
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Pakistan's first automated digital poultry layer investment infrastructure. We manage, vaccinate, feed, and house high-yield hens on biosecure automated commercial poultry farms while you collect guaranteed daily egg yields digitally.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>ISO 9001 Certified Aviary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Insured Birds</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="hover:text-amber-400 transition"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="hover:text-amber-400 transition"
                >
                  Layer Hen Packages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-amber-400 transition"
                >
                  How Digital Ownership Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('calculator')}
                  className="hover:text-amber-400 transition"
                >
                  Egg Return Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-400 transition"
                >
                  Biosecure Farm Facilities
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="hover:text-amber-400 transition"
                >
                  Investor Login
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="hover:text-amber-400 transition"
                >
                  Create Investment Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('customer-my-hens')}
                  className="hover:text-amber-400 transition"
                >
                  My Owned Hens
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('customer-withdrawals')}
                  className="hover:text-amber-400 transition"
                >
                  Withdrawal Requests
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-login')}
                  className="text-pink-400 hover:text-pink-300 font-bold transition flex items-center gap-1"
                >
                  <span>Admin Portal Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Contact Agrotech</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Sector F-8/3, Agro Industrial Park, Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+92 300 8476546</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>support@metaeggs.com</span>
              </li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Support Open 24/7
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-[11px] text-slate-400 leading-relaxed">
          <p className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
            <strong className="text-slate-300">Digital Ownership Clarification:</strong> Customers purchase fractional flock ownership in commercially managed poultry layer houses. Hens remain physically housed, vaccinated, and attended in certified environmentally controlled poultry sheds. Egg yields are sold daily into bulk wholesale markets and credited to investor wallets.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Meta Eggs Investment Agrotech Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 cursor-pointer">Biosecurity Audit</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

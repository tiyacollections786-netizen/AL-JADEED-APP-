import React, { useState } from 'react';
import {
  Egg,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Award,
  Building2,
  Layers,
  Send,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface InfoPageProps {
  type: 'how-it-works' | 'about' | 'faq' | 'contact';
  onNavigate: (view: string) => void;
}

export const InfoPages: React.FC<InfoPageProps> = ({ type, onNavigate }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);

  return (
    <div className="bg-white min-h-screen py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HOW IT WORKS */}
        {type === 'how-it-works' && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Transparent Operations
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display">
                How Digital Hen Ownership Works
              </h1>
              <p className="text-sm text-slate-600">
                Understanding the modern agricultural model where technology connects commercial egg production with digital investors.
              </p>
            </div>

            <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Egg className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold">The Core Model: Hens Stay on the Farm</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Customers often ask: <strong className="text-white">"Do you ship the hens to my house?"</strong> The answer is <strong>No</strong>. Commercial poultry layer hens require precise temperature regulation (22°C - 24°C), automated ventilation, strict lighting schedules, and specialized biosecurity sanitization to produce daily grade-A table eggs. Keeping them at a private residence would result in stress, disease, and high mortality.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Instead, when you purchase hens on Meta Eggs, our automated operations assign verified bird identification codes to your portfolio. We supply the high-protein feed, veterinary vaccines, automated nipple drinking lines, and climate controls. The fresh table eggs harvested every morning are sold in bulk to hypermarkets, bakeries, and distribution centers across Pakistan. Your share of the gross sales is credited daily to your wallet balance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Stage 1</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Flock Selection & Lot Order</h4>
                <p className="text-slate-600">
                  Select your desired breed tier (White Leghorn, Golden Comet, etc.) and enter your quantity (1, 2, 10, or 50+ hens).
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Stage 2</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Instant Bank Payment</h4>
                <p className="text-slate-600">
                  Transfer payment via Bank Alfalah, EasyPaisa, JazzCash, or USDT stablecoin. Once verified, ownership is activated.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-600 uppercase">Stage 3</span>
                <h4 className="font-extrabold text-slate-900 text-sm">Daily Egg Dividends</h4>
                <p className="text-slate-600">
                  Every 24 hours, dividends from egg harvest sales are added to your balance. Withdraw at any time to your bank account!
                </p>
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => onNavigate('packages')}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
              >
                Browse Layer Packages
              </button>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {type === 'about' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Sustainable Agribusiness
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display">
                About Meta Eggs Layer Aviaries
              </h1>
              <p className="text-sm text-slate-600">
                Pioneering automated closed-house poultry infrastructure in Islamabad, Pakistan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                <h3 className="text-lg font-bold text-slate-900">
                  State-of-the-Art Closed-House Layer Sheds
                </h3>
                <p>
                  Meta Eggs operates a multi-shed automated layer complex with a standing flock capacity exceeding 120,000 birds. Our facilities utilize European-standard Big Dutchman automated climate control, egg collection conveyors, and multi-stage air filtration.
                </p>
                <p>
                  Every flock is vaccinated according to national avian biosecurity guidelines under the direct supervision of certified doctors of veterinary medicine (DVM).
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Zero Antibiotic Growth Promoters</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Automated Egg Sorting & Grading</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Environmental Telemetry</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80"
                  alt="Modern Commercial Poultry Shed"
                  className="w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTACT */}
        {type === 'contact' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-950 font-display">Contact Us</h1>
              <p className="text-xs text-slate-500">
                Have questions about flock investment or bank transfers? Our agro-desk is available 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-6">
                <h3 className="font-bold text-base">Agro Support Headquarters</h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 mt-0.5" />
                    <span>Sector F-8/3, Agro Industrial Park, Islamabad, Pakistan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>+92 300 8476546</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>support@metaeggs.com</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                {contactSubmitted ? (
                  <div className="p-6 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-bold text-slate-900 text-sm">Message Transmitted!</h4>
                    <p className="text-xs text-slate-500">
                      Our support officer will contact you within 2 business hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setContactSubmitted(true);
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Usman Lodhi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        placeholder="usman@example.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Message</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Inquiry regarding flock allocations..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl shadow-xs transition"
                    >
                      Send Inquiry
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

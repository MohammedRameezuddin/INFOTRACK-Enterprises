import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Check } from 'lucide-react';
import { Logo } from './Logo';
import { db } from '../db/mockDb';
import heroPreview from '../assets/hero.png';

export const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const supportPhone = db.getSupportPhone();
  const alternatePhone = db.getAlternatePhone();
  const supportEmail = db.getSupportEmail();

  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={heroPreview}
                alt="Infotrack enterprise brochure"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
              <div className="absolute left-5 right-5 bottom-5 text-white space-y-2">
                <div className="flex items-center space-x-3">
                  <Logo size={34} />
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">INFOTRACK</p>
                    <h2 className="text-2xl font-heading font-bold leading-none">Enterprises</h2>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed">
                  Premium enterprise-grade digital systems and IT products. Transforming workspace technology with scalable networks, advanced CCTV security, custom AMC contracts, and expert support services.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-600 border border-primary-500/20">ISO 9001:2015</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">Authorized Partner</span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900 leading-none">Our Head Office</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      Nalgonda Main Office<br />
                      Old Vt Colony Near Katatiya Degree College<br />
                      Nalgonda, Telangana - 508001
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pt-1">
                  <Globe className="w-5 h-5 text-electric-light shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900 leading-none">Regional Uptime Coverage</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Serving Hyderabad, Nalgonda, Suryapet, Warangal, Khammam, Vijayawada, and across Telangana & AP.
                    </p>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="rounded-xl overflow-hidden border border-slate-200 mt-2">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15228.73447265625!2d79.26!3d17.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc8a0b5e0b4f4e1%3A0x6c1b1b1b1b1b1b1b!2sNalgonda%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                    width="100%"
                    height="150"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Infotrack Enterprises Office Location"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white shadow-sm">
              <h3 className="font-heading font-semibold text-slate-900 text-sm uppercase tracking-wider mb-4">Core Solutions</h3>
              <ul className="space-y-2 text-sm font-medium">
                <li>Annual Maintenance Contracts (AMC)</li>
                <li>CCTV Security & Surveillance Installation</li>
                <li>On-Site Contact IT Support</li>
                <li>Network Design & Maintenance</li>
                <li>Managed Backup & Cloud Recovery</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white shadow-sm">
              <h3 className="font-heading font-semibold text-slate-900 text-sm uppercase tracking-wider mb-4">Newsletter</h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                Subscribe to receive tech briefs, enterprise inventory releases, and local IT service pricing reports.
              </p>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enterprise@domain.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-l-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
                >
                  {subscribed ? <Check className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </button>
              </form>
              {subscribed && <p className="text-xs text-green-600 mt-2">Successfully subscribed to IT releases.</p>}
            </div>

            <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white shadow-sm">
              <h3 className="font-heading font-semibold text-slate-900 text-sm uppercase tracking-wider mb-4">Contact</h3>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-primary-400" />
                  <a href={`tel:${supportPhone}`} className="hover:text-slate-900 transition-colors">
                    +91 99666 00646 (Primary)
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-electric-light" />
                  <a href={`tel:${alternatePhone}`} className="hover:text-slate-900 transition-colors">
                    +91 99082 43746 (Alternate)
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-primary-400" />
                  <a href={`mailto:${supportEmail}`} className="hover:text-slate-900 transition-colors">
                    infotrackenterprises@gmail.com
                  </a>
                </div>
              </div>

              {/* GST & Business Details */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">Business Details</p>
                <p className="text-[10px] text-slate-500">Proprietor: <span className="font-semibold text-slate-700">Mohd Irfan Uddin</span></p>
                <p className="text-[10px] text-slate-500">GSTIN: <span className="font-semibold text-slate-700">36XXXXXXXXX1Z5</span></p>
                <p className="text-[10px] text-slate-500">Business Type: <span className="font-semibold text-slate-700">Proprietorship</span></p>
                <p className="text-[10px] text-slate-400 italic mt-1">* Replace with actual GSTIN when available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 p-5 sm:p-6 bg-white shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h3 className="font-heading font-semibold text-slate-900 text-sm uppercase tracking-wider mb-2">Why choose us</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                Our workflows cover AMC contracts, CCTV installations, on-site IT support, backup and recovery, and office technology deployment with a focus on uptime and service clarity.
              </p>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              © 2026 INFOTRACK ENTERPRISES. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <a href="https://infotrack-enterprise.vercel.app" onClick={(e) => { e.preventDefault(); }} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer">Privacy Policy</a>
            <a href="https://infotrack-enterprise.vercel.app" onClick={(e) => { e.preventDefault(); }} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer">Terms of Service</a>
            <a href="https://infotrack-enterprise.vercel.app" onClick={(e) => { e.preventDefault(); }} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer">SLA Agreement</a>
            <a href="https://infotrack-enterprise.vercel.app" onClick={(e) => { e.preventDefault(); }} className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

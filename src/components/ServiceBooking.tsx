import React, { useEffect, useState } from 'react';
import { Server, Video, Network, ShieldCheck, Calendar, Phone, FileText, CheckCircle2, MessageSquare } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Service, User } from '../db/mockDb';

interface ServiceBookingProps {
  currentUser: User;
  setView: (view: string) => void;
  setWhatsAppContext: (service: { title: string } | undefined) => void;
}

export const ServiceBooking: React.FC<ServiceBookingProps> = ({
  currentUser,
  setView,
  setWhatsAppContext,
}) => {
  const [services, setServices] = useState(() => db.getServices());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const svcs = await db.fetchServices();
        if (!mounted) return;
        setServices(svcs || db.getServices());
      } catch {
        setServices(db.getServices());
      }
    })();
    return () => { mounted = false; };
  }, []);
  const supportPhone = db.getSupportPhone();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form states
  const [customerName, setCustomerName] = useState(currentUser.name);
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone);
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !preferredDate) return;

    const request = db.createServiceRequest({
      userId: currentUser.id,
      customerName,
      customerPhone,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      message,
      preferredDate,
    });

    setCreatedRequestId(request.id);
    setIsSubmitted(true);
    setWhatsAppContext(undefined);

    window.open(
      `https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello, I submitted a service request for "${selectedService.title}". Request ID: ${request.id}. Preferred date: ${preferredDate}. Contact: ${customerName} (${customerPhone}).`)}`,
      '_blank',
      'noreferrer'
    );
  };

  const resetForm = () => {
    setSelectedService(null);
    setPreferredDate('');
    setMessage('');
    setIsSubmitted(false);
  };

  const getServiceIcon = (category: string) => {
    if (category === 'AMC') return Server;
    if (category === 'Installation') return Video;
    if (category === 'Consultation') return Network;
    return ShieldCheck;
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-left space-y-2 max-w-3xl">
        <h1 className="text-3xl font-heading font-bold text-slate-900">Book Enterprise Support & Installations</h1>
        <p className="text-slate-400 text-sm">
          Schedule site visits, request network audits, or configure Annual Maintenance Contracts (AMC) with certified systems engineering personnel.
        </p>
      </div>

      {!selectedService ? (
        /* Services List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {services.map(serv => {
            const Icon = getServiceIcon(serv.category);
            return (
              <div
                key={serv.id}
                className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 text-left"
              >
                <div className="w-full sm:w-1/3 aspect-video sm:aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={serv.imageUrl} alt={serv.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-primary-600/20 border border-primary-500/20 p-1.5 rounded-lg text-primary-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">
                        {serv.category}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900">{serv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{serv.description}</p>
                    
                    {/* Features checklist */}
                    <ul className="text-[11px] text-slate-300 space-y-1 pt-2">
                      {serv.features.slice(0, 3).map((f, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-white/5">
                    <button
                      onClick={() => {
                        setSelectedService(serv);
                        setWhatsAppContext({ title: serv.title });
                      }}
                      className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Request on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : isSubmitted ? (
        /* Success Screen */
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm backdrop-blur-md">
          <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-slate-900">Booking Registered Successfully</h2>
            <p className="text-xs text-slate-400">Request ID: <span className="font-mono text-primary-400 font-bold">{createdRequestId}</span></p>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Our engineering coordinator will review the scope of work for <strong>{selectedService.title}</strong> and contact you to confirm the appointment date.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-400">Preferred Date:</span>
              <span className="font-semibold text-slate-900">{preferredDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-400">Registered Name:</span>
              <span className="font-semibold text-slate-900">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Contact:</span>
              <span className="font-semibold text-slate-900">{customerPhone}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setView('portal')}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Track in Client Portal
            </button>
            <a
              href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello, I submitted service booking request "${createdRequestId}" for CCTV/AMC support. Please expedite our onsite survey.`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Coordination</span>
            </a>
          </div>

          <button
            onClick={resetForm}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Schedule Another Service
          </button>
        </div>
      ) : (
        /* Booking Form View */
        <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Scheduling Scope</span>
              <h2 className="text-xl font-heading font-bold text-slate-900 mt-1">{selectedService.title}</h2>
            </div>
            <button
              onClick={() => {
                setSelectedService(null);
                setWhatsAppContext(undefined);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
            >
              Cancel Selection
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact Name</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferred Audit Date</span>
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Describe Requirements (e.g. number of cameras, laptop models, network layout details)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                placeholder="Include specifications or issue symptoms..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
            </div>

            {/* Removed price display warning */}
            {/* <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-900">💰 Estimate Audit Guidelines:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Local visits inside Telangana (Hyderabad) and Andhra Pradesh (Vijayawada) carry a base transport charge.</li>
                <li>Commercial contracts (AMC) are custom calculated according to server volume and network complexity.</li>
              </ul>
            </div> */}

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl text-xs font-bold transition-all shadow-lg glow-primary"
              >
                Send Service Request on WhatsApp
              </button>
              
              <a
                href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello, I am requesting onsite support for "${selectedService.title}". Contact Name: ${customerName}. Phone: ${customerPhone}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 fill-emerald-400/10" />
                <span>Expedite via WhatsApp</span>
              </a>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

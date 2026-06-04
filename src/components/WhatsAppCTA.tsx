import React, { useState } from 'react';
import { MessageSquare, Send, X, ShieldCheck } from 'lucide-react';
import { db } from '../db/mockDb';

interface WhatsAppCTAProps {
  activeProduct?: { title: string; price: number };
  activeService?: { title: string };
}

export const WhatsAppCTA: React.FC<WhatsAppCTAProps> = ({ activeProduct, activeService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Default pre-filled message builders
  const getPlaceholder = () => {
    if (activeProduct) {
      return `Hello, I am interested in buying the "${activeProduct.title}" listed at ₹${activeProduct.price.toLocaleString('en-IN')}. Please provide delivery terms.`;
    }
    if (activeService) {
      return `Hello, I want to book the "${activeService.title}" service for our company office. Please share a commercial quote.`;
    }
    return `Hello, I would like to inquire about IT hardware supply, AMC service pricing, or network cabling audits for my business.`;
  };

  const handleSend = () => {
    const textToSend = message.trim() || getPlaceholder();
    const encodedText = encodeURIComponent(textToSend);
    // WhatsApp business link simulation
    const whatsappUrl = `https://wa.me/${db.getSupportPhone()}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setMessage('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-start">
      {/* Floating Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  IT
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm leading-tight text-white">Infotrack Business Support</h4>
                <p className="text-[10px] text-emerald-100 flex items-center space-x-0.5">
                  <ShieldCheck className="w-3 h-3 shrink-0" />
                  <span>Typically responds in 5 mins</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-white space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">💡 Pre-filled Context Detected:</p>
              <p className="italic text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
                {getPlaceholder()}
              </p>
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Customize Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message details here..."
                rows={3}
                className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-green-500 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Inquiry</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group glow-electric border border-emerald-400/20"
        title="Chat with WhatsApp Business"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-6 transition-transform" />
        
        {/* Unread Alert dot if a item is active */}
        {(activeProduct || activeService) && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
        )}
      </button>
    </div>
  );
};

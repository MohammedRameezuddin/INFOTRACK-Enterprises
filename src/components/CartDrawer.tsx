import React, { useState } from 'react';
import { X, Trash2, MessageSquare, ExternalLink } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Product, User } from '../db/mockDb';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currentUser: User;
  setView: (view: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  setCart,
  currentUser,
  setView,
}) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const updateQty = (prodId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === prodId) {
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: Math.min(item.product.stock, nextQty) };
      }
      return item;
    }));
  };

  const removeItem = (prodId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  const handleSendWhatsApp = () => {
    if (cart.length === 0) return;

    const itemsSummary = cart.map(item => `${item.product.title} x${item.quantity}`).join(', ');
    const note = message.trim() ? `\nNote: ${message.trim()}` : '';
    const whatsappText = `Hello, ${currentUser.name}. I would like to enquire about these selections: ${itemsSummary}.${note}`;

    window.open(`https://wa.me/${db.getSupportPhone()}?text=${encodeURIComponent(whatsappText)}`, '_blank', 'noreferrer');
    onClose();
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/85 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl relative">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-slate-900">Your WhatsApp Selection</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.map(item => (
            <div
              key={item.product.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.title}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
              />

              <div className="flex-1 text-left">
                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate max-w-[150px]">{item.product.title}</h4>
                <p className="text-slate-500 font-medium text-xs mt-0.5">Selected for WhatsApp inquiry</p>

                <div className="flex items-center space-x-2 mt-2 bg-white border border-slate-200 rounded-lg px-2 w-max scale-90 origin-left">
                  <button onClick={() => updateQty(item.product.id, -1)} className="text-slate-500 hover:text-slate-900">-</button>
                  <span className="text-xs font-bold text-slate-900 px-2">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product.id, 1)} className="text-slate-500 hover:text-slate-900">+</button>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.product.id)}
                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <p className="font-semibold mb-2">No hardware items configured</p>
              <p className="text-xs">Browse the enterprise catalog to add components.</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Add a note for the WhatsApp message..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
            />

            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg glow-primary flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Selection on WhatsApp</span>
            </button>

            <button
              onClick={() => setView('portal')}
              className="w-full py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Client Portal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

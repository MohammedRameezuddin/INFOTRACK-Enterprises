import React, { useState } from 'react';
import { X, Trash2, Tag, Percent, CreditCard, ShieldCheck, CheckCircle2, Loader2, Landmark } from 'lucide-react';
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
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // Percentage
  const [couponFeedback, setCouponFeedback] = useState({ text: '', type: '' });
  const [shippingAddress, setShippingAddress] = useState('Gachibowli Financial District, Nanakramguda, Hyderabad, Telangana - 500032');
  
  // Checkout & Razorpay states
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculators
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = taxableAmount * 0.18; // 18% GST standard in India
  const grandTotal = taxableAmount + gstAmount;

  // Modifiers
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

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();

    if (code === 'INFOTRACK10') {
      setAppliedDiscount(10);
      setCouponFeedback({ text: 'INFOTRACK10 applied! 10% discount subtracted.', type: 'success' });
    } else if (code === 'ENTERPRISE') {
      if (subtotal >= 200000) {
        setAppliedDiscount(15);
        setCouponFeedback({ text: 'ENTERPRISE applied! 15% bulk discount subtracted.', type: 'success' });
      } else {
        setCouponFeedback({ text: 'ENTERPRISE coupon requires cart value above ₹2,00,000.', type: 'error' });
      }
    } else {
      setCouponFeedback({ text: 'Invalid coupon code.', type: 'error' });
    }
  };

  const triggerCheckout = () => {
    if (!shippingAddress.trim()) {
      alert('Please fill out shipping delivery coordinates.');
      return;
    }
    setShowRazorpay(true);
  };

  const handleRazorpayPayment = () => {
    setIsProcessingPayment(true);

    // Simulate standard payment gateway latency
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaymentSuccess(true);

      // Create order inside DB state
      const orderItems = cart.map(item => ({
        productId: item.product.id,
        productTitle: item.product.title,
        quantity: item.quantity,
        price: item.product.price
      }));

      db.createOrder({
        userId: currentUser.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        items: orderItems,
        totalPrice: grandTotal,
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        shippingAddress,
        paymentId: `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      });

      // Clear Cart
      setTimeout(() => {
        setCart([]);
        setShowRazorpay(false);
        setIsPaymentSuccess(false);
        onClose();
        setView('portal'); // Navigate to client portal
      }, 1500);

    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white/85 backdrop-blur-xs flex justify-end">
      
      {/* Container */}
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-heading font-bold text-lg text-slate-900">Your Workspace Cart</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
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
                <p className="text-primary-400 font-medium text-xs mt-0.5">₹{item.product.price.toLocaleString('en-IN')}</p>
                
                {/* Quantity Editor */}
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

        {/* Checkout Calculator / Billing */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
            
            {/* Coupon field */}
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon: INFOTRACK10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                />
                <Tag className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
              </div>
              <button
                type="submit"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
              >
                Apply
              </button>
            </form>
            
            {couponFeedback.text && (
              <p className={`text-[10px] font-semibold text-left ${couponFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {couponFeedback.text}
              </p>
            )}

            {/* Address */}
            <div className="text-left space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Shipping & Delivery Address
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            {/* Invoice specs */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs text-slate-600 shadow-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-100">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center space-x-1">
                    <Percent className="w-3 h-3" />
                    <span>Discount ({appliedDiscount}%):</span>
                  </span>
                  <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (18% Commercial):</span>
                <span className="font-semibold text-slate-100">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-primary-400">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={triggerCheckout}
              className="w-full py-3.5 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl text-xs font-bold transition-all shadow-lg glow-primary"
            >
              Propose & Checkout Order
            </button>
          </div>
        )}

      </div>

      {/* Razorpay Simulation Modal */}
      {showRazorpay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="bg-slate-50 p-4 text-slate-900 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Landmark className="w-5 h-5 text-blue-400" />
                <span className="font-heading font-extrabold text-sm tracking-widest text-slate-700 uppercase">
                  Razorpay Secure
                </span>
              </div>
              <button
                disabled={isProcessingPayment}
                onClick={() => setShowRazorpay(false)}
                className="text-slate-400 hover:text-slate-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isPaymentSuccess ? (
              /* Success checkmark */
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">Payment Authorized</h3>
                <p className="text-xs text-slate-400">Transaction ID: TXN_{Math.floor(Math.random()*900000)}</p>
                <p className="text-xs text-slate-500">Creating order invoices inside PostgreSQL db...</p>
              </div>
            ) : (
              /* Details Form */
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Checkout Total Amount</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">₹{grandTotal.toLocaleString('en-IN')}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Infotrack Enterprises (HYD/AP)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 border rounded-xl font-semibold flex flex-col items-center justify-center space-y-1.5 transition-colors ${
                        paymentMethod === 'card' 
                          ? 'border-primary-500 bg-primary-50 text-slate-900' 
                          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 border rounded-xl font-semibold flex flex-col items-center justify-center space-y-1.5 transition-colors ${
                        paymentMethod === 'upi' 
                          ? 'border-primary-500 bg-primary-50 text-slate-900' 
                          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>UPI</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-2.5 border rounded-xl font-semibold flex flex-col items-center justify-center space-y-1.5 transition-colors ${
                        paymentMethod === 'netbanking' 
                          ? 'border-primary-500 bg-primary-50 text-slate-900' 
                          : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Landmark className="w-4 h-4" />
                      <span>NetBank</span>
                    </button>
                  </div>
                </div>

                {/* Form fields depending on method */}
                {paymentMethod === 'card' && (
                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      placeholder="Card Number (4111 2222 3333 4444)"
                      defaultValue="4111 2222 3333 4444"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM/YY" defaultValue="12/29" className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800" />
                      <input type="password" placeholder="CVV" defaultValue="123" className="bg-white border border-slate-200 rounded-lg p-2.5 text-slate-800" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <input
                    type="text"
                    placeholder="Enter UPI VPA (e.g. name@okhdfc)"
                    defaultValue="jane@okhdfc"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                  />
                )}

                {paymentMethod === 'netbanking' && (
                  <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800">
                    <option>HDFC Corporate Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                  </select>
                )}

                <button
                  disabled={isProcessingPayment}
                  onClick={handleRazorpayPayment}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-colors shadow-lg mt-4"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing transaction...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay Securely ₹{grandTotal.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

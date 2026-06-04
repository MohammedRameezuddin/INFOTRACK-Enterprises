import React, { useState, useEffect } from 'react';
import { Package, ShieldCheck, MapPin, Calendar, Clock, UserCheck, MessageSquare } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Order, ServiceRequest, User } from '../db/mockDb';

interface CustomerPortalProps {
  currentUser: User;
  setView: (view: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentUser, setView }) => {
  const supportPhone = db.getSupportPhone();
  const [activeTab, setActiveTab] = useState<'orders' | 'services'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    // Filter by current user ID
    const allOrders = db.getOrders();
    setOrders(allOrders.filter(o => o.userId === currentUser.id));

    const allRequests = db.getServiceRequests();
    setServiceRequests(allRequests.filter(r => r.userId === currentUser.id));
  }, [currentUser]);

  const getStatusColor = (status: Order['orderStatus']) => {
    if (status === 'Delivered') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (status === 'Processing' || status === 'Shipped') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (status === 'Cancelled') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const getServiceStatusColor = (status: ServiceRequest['status']) => {
    if (status === 'Completed') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (status === 'Assigned') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (status === 'Cancelled') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-left space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Enterprise Dashboard</span>
        <h1 className="text-3xl font-heading font-bold text-slate-900">Welcome Back, {currentUser.name}</h1>
        <p className="text-slate-400 text-sm">
          Track procurement delivery status, verify payment receipts, or monitor scheduled IT service engineer audits.
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-bold text-left">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center space-x-2 ${
            activeTab === 'orders' ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Procurement Orders ({orders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-1 border-b-2 ml-8 transition-all flex items-center space-x-2 ${
            activeTab === 'services' ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>IT & CCTV Bookings ({serviceRequests.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'orders' ? (
        /* Orders list */
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm"
            >
              {/* Top Meta info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-slate-900 text-base">Order ID: #{order.id.split('-')[1] || order.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Placed on: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Grand Total Invoice</p>
                  <p className="text-xl font-heading font-extrabold text-primary-400 mt-1">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Inventory Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="text-left">
                        <span className="font-semibold text-slate-900">{item.productTitle}</span>
                        <span className="text-slate-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-slate-300">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Shipping details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1.5">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                    <span>Delivery Address Coordinates</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium pl-4.5">{order.shippingAddress}</p>
                </div>

                <div className="space-y-1.5 md:border-l md:border-slate-200 md:pl-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                      <span>Razorpay Verification Details</span>
                    </span>
                    <p className="text-slate-300 pl-4.5 font-mono">ID: {order.paymentId || 'Pending Authorization'}</p>
                    <p className="text-slate-300 pl-4.5">Status: <span className="text-green-400 font-semibold capitalize">{order.paymentStatus}</span></p>
                  </div>
                  
                  {order.orderStatus !== 'Delivered' && (
                    <a
                      href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello, I would like an update on delivery status for Order #${order.id}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1 mt-3"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Inquire Delivery via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 shadow-sm">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="font-semibold text-lg text-slate-900 mb-1">No orders found</p>
              <p className="text-sm mb-4">You have not initiated any hardware supply transactions yet.</p>
              <button
                onClick={() => setView('store')}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Go to Enterprise Store
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Service Requests list */
        <div className="space-y-6">
          {serviceRequests.map(req => (
            <div
              key={req.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-left space-y-6 shadow-sm"
            >
              {/* Header metadata */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-heading font-bold text-slate-900 text-base">{req.serviceTitle}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getServiceStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Schedule ID</span>
                  <p className="font-mono font-bold text-primary-400 text-sm mt-1">#{req.id}</p>
                </div>
              </div>

              {/* Requirement Details */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Problem / Scope Description</span>
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 leading-relaxed italic">
                  "{req.message}"
                </p>
              </div>

              {/* Assigned Coordinator / Technician */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-2">
                  <span className="text-slate-500 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-primary-400" />
                    <span>Appointment Schedule</span>
                  </span>
                  <p className="text-slate-700 pl-4.5">Target Visit Date: <strong className="text-slate-900 font-semibold">{req.preferredDate}</strong></p>
                </div>

                <div className="space-y-2 md:border-l md:border-slate-200 md:pl-6 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-slate-500 font-semibold flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-primary-400" />
                      <span>Onsite Support Staff</span>
                    </span>
                    <p className="text-slate-200 pl-4.5">
                      {req.assignedEngineer ? (
                        <>
                          Engineer: <strong className="text-slate-900 font-semibold">{req.assignedEngineer}</strong>
                        </>
                      ) : (
                        <span className="italic text-slate-500">Awaiting engineer allocation</span>
                      )}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(`Hello, I need an update on Service Booking Request #${req.id} for "${req.serviceTitle}".`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1 mt-3"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Coordinate via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {serviceRequests.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 shadow-sm">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="font-semibold text-lg text-slate-900 mb-1">No service bookings found</p>
              <p className="text-sm mb-4">You have not scheduled any technical service audits yet.</p>
              <button
                onClick={() => setView('services')}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Book Technical Support
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, Coins, ShoppingBag, Eye, Calendar, X, User, Printer, Star } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Product, Order, ServiceRequest, Review } from '../db/mockDb';
import { Logo } from './Logo';

export const AdminDashboard: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'products' | 'orders' | 'services' | 'reviews' | 'settings'>('analytics');
  const [settingVideoUrl, setSettingVideoUrl] = useState(db.getIntroVideoUrl());
  const [settingSupportPhone, setSettingSupportPhone] = useState(db.getSupportPhone());
  const [settingAlternatePhone, setSettingAlternatePhone] = useState(db.getAlternatePhone());
  const [settingSupportEmail, setSettingSupportEmail] = useState(db.getSupportEmail());
  const [settingSupportAddress, setSettingSupportAddress] = useState(db.getSupportAddress());
  const [settingDirectorName, setSettingDirectorName] = useState(db.getDirectorName());

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.setIntroVideoUrl(settingVideoUrl);
    db.setSupportPhone(settingSupportPhone);
    db.setAlternatePhone(settingAlternatePhone);
    db.setSupportEmail(settingSupportEmail);
    db.setSupportAddress(settingSupportAddress);
    db.setDirectorName(settingDirectorName);
    alert('Settings successfully updated on the platform!');
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This will clear all orders, reviews, and stories. This action cannot be undone.')) {
      db.resetDatabase();
      loadDb();
      alert('All platform data has been reset.');
    }
  };
  
  // DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Product CRUD Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('Laptops');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodDescription, setProdDescription] = useState('');
  const [prodSpecs, setProdSpecs] = useState('{"Processor": "Intel i7", "RAM": "16GB", "Storage": "512GB SSD"}');
  const [prodImages, setProdImages] = useState<string[]>([]);

  // Order Details / Invoice Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load database tables
  const loadDb = () => {
    (async () => {
      try {
        const prods = await db.fetchProducts();
        setProducts(prods || db.getProducts());
      } catch {
        setProducts(db.getProducts());
      }
    })();

    setOrders(db.getOrders());
    setServiceRequests(db.getServiceRequests());
    setReviews(db.getReviews());
  };

  useEffect(() => {
    loadDb();
  }, []);

  // Recalculate KPIs
  const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingAudits = serviceRequests.filter(r => r.status === 'Pending').length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Chart Data preparation
  // Group orders by month/date for sales chart
  const salesChartData = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.name === date);
      if (existing) {
        existing.Sales += order.totalPrice;
      } else {
        acc.push({ name: date, Sales: order.totalPrice });
      }
      return acc;
    }, [] as { name: string; Sales: number }[])
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  // Group products by category for stock chart
  const categoriesData = ['Laptops', 'Servers', 'CCTV & Security', 'Networking'].map(cat => ({
    Category: cat,
    Items: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock, 0),
    Value: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.price * p.stock, 0) / 100000 // In Lakhs
  }));

  // Handle Product Save (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodBrand || prodPrice <= 0) return;

    let specsObj = {};
    try {
      specsObj = JSON.parse(prodSpecs);
    } catch {
      alert('Invalid specifications JSON syntax. Please verify.');
      return;
    }

    const mockEmbedding = [
      prodCategory === 'Laptops' ? 0.8 : 0.4,
      prodCategory === 'CCTV & Security' ? 0.9 : 0.6,
      prodCategory === 'Servers' ? 0.95 : 0.5,
      prodPrice < 50000 ? 0.9 : 0.4,
      prodCategory === 'Laptops' ? 0.95 : 0.2
    ];

    const prodData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      title: prodTitle,
      brand: prodBrand,
      category: prodCategory,
      price: prodPrice,
      stock: prodStock,
      rating: editingProduct ? editingProduct.rating : 5.0,
      description: prodDescription,
      specs: specsObj,
      embedding: mockEmbedding,
      images: prodImages.length > 0 ? prodImages : (editingProduct ? editingProduct.images : ['https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=600&auto=format&fit=crop']),
      created_at: editingProduct ? editingProduct.created_at : new Date().toISOString()
    };

    db.saveProduct(prodData);
    loadDb();
    setShowProductModal(false);
    setEditingProduct(null);
    clearForm();
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdTitle(prod.title);
    setProdBrand(prod.brand);
    setProdCategory(prod.category);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdDescription(prod.description);
    setProdSpecs(JSON.stringify(prod.specs, null, 2));
    setProdImages(prod.images || []);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this hardware from the catalog?')) {
      db.deleteProduct(id);
      loadDb();
    }
  };

  const clearForm = () => {
    setProdTitle('');
    setProdBrand('');
    setProdCategory('Laptops');
    setProdPrice(0);
    setProdStock(0);
    setProdDescription('');
    setProdSpecs('{"Processor": "Intel i7", "RAM": "16GB", "Storage": "512GB SSD"}');
    setProdImages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProdImages([reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Order Status
  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    db.updateOrderStatus(orderId, status);
    loadDb();
  };

  // Handle Service Request Status & Assignment
  const handleAssignEngineer = (id: string, engineerName: string) => {
    db.updateServiceRequestStatus(id, 'Assigned', engineerName);
    loadDb();
  };

  const handleCompleteService = (id: string) => {
    db.updateServiceRequestStatus(id, 'Completed');
    loadDb();
  };

  // Handle Delete Review
  const handleDeleteReview = (id: string) => {
    if (confirm('Moderate and delete this review comment?')) {
      db.deleteReview(id);
      loadDb();
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 text-left">
        <Logo size={40} />
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900 flex items-center space-x-2">
            <span>Corporate Admin Control Panel</span>
          </h1>
          <p className="text-slate-600 text-sm">
            Control platform operations, supply inventory catalogues, generate commercial invoices, and moderate customer reviews.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue Authorized', val: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: Coins, color: 'text-green-400 border-green-500/20 bg-green-500/5' },
          { label: 'Scheduled Service Audits', val: pendingAudits.toString(), icon: Calendar, color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' },
          { label: 'Total Procurement Orders', val: orders.length.toString(), icon: ShoppingBag, color: 'text-primary-400 border-primary-500/20 bg-primary-500/5' },
          { label: 'Out of Stock Items', val: outOfStockCount.toString(), icon: AlertTriangle, color: outOfStockCount > 0 ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-slate-500 border-white/5 bg-white/5' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-6 border rounded-2xl text-left flex items-center justify-between ${kpi.color}`}>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{kpi.label}</p>
                <p className="text-2xl font-heading font-extrabold text-slate-900">{kpi.val}</p>
              </div>
              <Icon className="w-8 h-8 opacity-80" />
            </div>
          );
        })}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-bold text-left overflow-x-auto pb-1">
        {[
          { id: 'analytics', label: 'Analytics' },
          { id: 'products', label: 'Products (CRUD)' },
          { id: 'orders', label: 'Orders Board' },
          { id: 'services', label: 'Service Audits' },
          { id: 'reviews', label: 'Review Moderation' },
          { id: 'settings', label: 'Platform Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-3 px-1 border-b-2 whitespace-nowrap transition-all mr-6 sm:mr-8 ${
              activeSubTab === tab.id ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Revenue Chart */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-slate-900 text-base">Sales Revenue Trend (₹)</h3>
            <div className="h-72 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.04)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(15,23,42,0.06)', color: '#0f172a' }} />
                  <Area type="monotone" dataKey="Sales" stroke="#6366f1" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Category Stock value */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="font-heading font-semibold text-slate-900 text-base">Stock Distribution vs Value (Lakhs)</h3>
            <div className="h-72 w-full text-xs font-mono">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="Category" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="Items" name="Stock Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Value" name="Asset Value (Lakhs)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Product Management Panel (CRUD) */}
      {activeSubTab === 'products' && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-semibold text-slate-900 text-base">Product Catalogue</h3>
              <button
              onClick={() => {
                setEditingProduct(null);
                clearForm();
                setShowProductModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Hardware</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white backdrop-blur-sm shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="p-4">Product ID</th>
                  <th className="p-4">Brand & Model</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(prod => (
                  <tr key={prod.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{prod.id.split('-')[1] || prod.id}</td>
                    <td className="p-4 font-semibold text-slate-900">{prod.brand} {prod.title}</td>
                    <td className="p-4 text-slate-300">{prod.category}</td>
                    <td className="p-4">
                      {prod.stock === 0 ? (
                        <span className="text-red-400 font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Out of Stock</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">{prod.stock} units available</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-900">₹{prod.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleEditProduct(prod)}
                        className="p-2 text-slate-500 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg transition-all"
                        title="Edit Model"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="p-2 text-slate-500 hover:text-red-400 bg-slate-50 border border-slate-200 rounded-lg transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Board */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6 text-left">
          <h3 className="font-heading font-semibold text-slate-900 text-base">Customer Orders & Invoices</h3>
          
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white backdrop-blur-sm shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Shipment Status</th>
                  <th className="p-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">#{order.id.split('-')[1] || order.id}</td>
                    <td className="p-4 font-semibold text-slate-900">
                      <p>{order.customerName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{order.customerEmail}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs focus:outline-none focus:border-primary-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 ml-auto text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Request Moderator */}
      {activeSubTab === 'services' && (
        <div className="space-y-6 text-left">
          <h3 className="font-heading font-semibold text-slate-900 text-base">Service Booking Operations</h3>
          
          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white backdrop-blur-sm shadow-sm">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <th className="p-4">Req ID</th>
                  <th className="p-4">Client Detail</th>
                  <th className="p-4">Booked Service</th>
                  <th className="p-4">Visit Date</th>
                  <th className="p-4">Assigned Engineer</th>
                  <th className="p-4 text-right">Status Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceRequests.map(req => (
                  <tr key={req.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">#{req.id}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{req.customerName}</p>
                      <p className="text-[10px] text-slate-500">{req.customerPhone}</p>
                    </td>
                    <td className="p-4 font-medium text-slate-200">
                      <p>{req.serviceTitle}</p>
                      <p className="text-[10px] text-slate-500 max-w-[200px] truncate italic">"{req.message}"</p>
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">{req.preferredDate}</td>
                    <td className="p-4">
                      {req.assignedEngineer ? (
                        <span className="text-slate-900 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span>{req.assignedEngineer}</span>
                        </span>
                      ) : (
                        <select
                          onChange={(e) => handleAssignEngineer(req.id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 text-xs focus:outline-none"
                          defaultValue=""
                        >
                          <option value="" disabled>-- Assign Support Staff --</option>
                          <option value="Vinay Kumar (Senior Network Architect)">Vinay Kumar (Networks)</option>
                          <option value="Amit Sharma (Surveillance Lead)">Amit Sharma (CCTV)</option>
                          <option value="Rohan Deshmukh (Systems Engineer)">Rohan Deshmukh (Hardware)</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {req.status !== 'Completed' ? (
                        <button
                          onClick={() => handleCompleteService(req.id)}
                          className="px-3 py-1.5 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 hover:border-green-500/40 text-green-400 font-bold rounded-lg text-[10px] uppercase tracking-wider"
                        >
                          Mark Complete
                        </button>
                      ) : (
                        <span className="text-green-500 font-bold text-[10px] uppercase tracking-wider">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Moderation */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6 text-left">
          <h3 className="font-heading font-semibold text-slate-900 text-base">Reviews Moderation & Spam Filter</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(rev => (
              <div
                key={rev.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 backdrop-blur-sm shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900 flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rev.userName}</span>
                    </span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{rev.comment}"</p>
                  <p className="text-[10px] text-slate-500">
                    Product ID: <span className="font-mono">{rev.productId}</span>
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-[10px]">
                  <span className="text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Comment</span>
                  </button>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="col-span-2 text-center text-slate-500 py-12">No client review ratings registered yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Settings Sub-Tab Panel */}
      {activeSubTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
          <div>
            <h3 className="font-heading font-semibold text-slate-900 text-base">Platform Administration Settings</h3>
            <p className="text-xs text-slate-400 mt-1">Configure global platform variables, video feeds, and WhatsApp coordination links.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="max-w-xl space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Intro Video Source URL (4-Minute Presentation or Tech Loop)
              </label>
              <input
                type="text"
                value={settingVideoUrl}
                onChange={(e) => setSettingVideoUrl(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="e.g. https://assets.mixkit.co/...mp4 or /public/intro.mp4"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                This URL sets the video loop played in the Hero background and the full cinematic walkthrough popped open by customers via the "Play Intro" triggers.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Enterprise Support WhatsApp Number (Primary)
              </label>
              <input
                type="text"
                value={settingSupportPhone}
                onChange={(e) => setSettingSupportPhone(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="e.g. 919966600646 (Country code + Phone number)"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Specify the primary business WhatsApp phone number where automated client purchase inquiries and support coordinates are routed.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Enterprise Support WhatsApp Number (Alternate)
              </label>
              <input
                type="text"
                value={settingAlternatePhone}
                onChange={(e) => setSettingAlternatePhone(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="e.g. 919908243746 (Country code + Phone number)"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Specify the alternate business WhatsApp phone number for fallback support links.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Enterprise Contact Email Address
              </label>
              <input
                type="email"
                value={settingSupportEmail}
                onChange={(e) => setSettingSupportEmail(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="e.g. infotrackenterprises@gmail.com"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Specify the corporate contact email displayed across headers, footers, and billing estimates.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Head Office Address Location
              </label>
              <textarea
                value={settingSupportAddress}
                onChange={(e) => setSettingSupportAddress(e.target.value)}
                required
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="Old Vt Colony Near Katatiya Degree College Nalgonda Telangana - 508001"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Specify the business registration location printed on client profiles and footer columns.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                Managing Director / Proprietor Name
              </label>
              <input
                type="text"
                value={settingDirectorName}
                onChange={(e) => setSettingDirectorName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
                placeholder="Mohd Irfan Uddin"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">
                Specify the business director name referenced in the profile directory and contact cards.
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                className="py-3 px-6 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl font-bold transition-all shadow-lg text-xs uppercase tracking-wider glow-primary"
              >
                Save Platform Configuration
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg text-xs uppercase tracking-wider"
              >
                Reset Platform Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Form Modal (Add / Edit) */}
      {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
            <button
              onClick={() => {
                setShowProductModal(false);
                setEditingProduct(null);
                clearForm();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-slate-900">
              {editingProduct ? 'Edit Catalog Hardware' : 'Add New Hardware Solution'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Model Title</label>
                  <input
                    type="text"
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Brand / OEM</label>
                  <input
                    type="text"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Servers">Servers</option>
                    <option value="CCTV & Security">CCTV & Security</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Price (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseInt(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Stock Count</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(parseInt(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Catalog Description</label>
                <textarea
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Product Photo / Image Upload</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-600/10 file:text-primary-400 hover:file:bg-primary-600/20"
                  />
                  {prodImages.length > 0 && (
                    <div className="w-12 h-12 rounded border border-slate-200 overflow-hidden shrink-0">
                      <img src={prodImages[0]} alt="Upload Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Technical Specifications (JSON format)</label>
                  <span className="text-[9px] text-primary-400">Validate JSON keys</span>
                </div>
                <textarea
                  value={prodSpecs}
                  onChange={(e) => setProdSpecs(e.target.value)}
                  rows={3}
                  className="w-full font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl font-bold transition-all shadow-lg text-xs uppercase tracking-wider glow-primary"
              >
                Save Hardware Specifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal (HTML Receipt rendering) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-sm">
          <div className="bg-white text-slate-800 border border-slate-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header info */}
            <div className="flex justify-between items-start border-b pb-4 border-slate-200">
              <div className="text-left space-y-1">
                <span className="font-heading font-extrabold text-lg tracking-tight text-primary-600">INFOTRACK ENTERPRISES</span>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none">B2B Hardware & Services Supply</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Level 5, T-Hub 2.0, Madhapur, Hyderabad, Telangana - 500081</p>
                <p className="text-[9px] text-slate-400 leading-none">GSTIN: 36AAAAA1111A1Z1 (Telangana)</p>
              </div>

              <div className="text-right space-y-1">
                <h3 className="font-heading font-bold text-base text-slate-700">COMMERCIAL INVOICE</h3>
                <p className="text-xs text-slate-600">Invoice: <strong className="font-mono text-slate-800">#INF_{selectedOrder.id}</strong></p>
                <p className="text-[11px] text-slate-500">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <span className="inline-block mt-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PAID RECEIVED
                </span>
              </div>
            </div>

            {/* Client address */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Bill To Client:</p>
                <p className="font-bold text-slate-800 mt-1">{selectedOrder.customerName}</p>
                <p className="text-slate-500 mt-0.5">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Ship Delivery To:</p>
                <p className="text-slate-600 mt-1 leading-relaxed">{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Rate (₹)</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 last:border-b-0 text-slate-700">
                      <td className="p-3 font-semibold text-slate-800">{item.productTitle}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Math breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-semibold text-slate-700">₹{(selectedOrder.totalPrice / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">CGST (9%):</span>
                  <span className="font-semibold text-slate-700">₹{(selectedOrder.totalPrice * 0.09 / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SGST (9%):</span>
                  <span className="font-semibold text-slate-700">₹{(selectedOrder.totalPrice * 0.09 / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-800">
                  <span>Grand Total (INR):</span>
                  <span className="text-primary-600">₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Footer / Print Actions */}
            <div className="flex justify-between items-center border-t pt-4 border-slate-200 text-[10px] text-slate-400">
              <div className="space-y-0.5">
                <p>Payment ID: <strong className="font-mono text-slate-700">{selectedOrder.paymentId || 'N/A'}</strong></p>
                <p>Computer-generated invoice. No physical signature required.</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center space-x-1.5 transition-colors border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

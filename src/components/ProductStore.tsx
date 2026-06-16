import React, { useState, useEffect } from 'react';
import { Search, Star, Filter, ArrowUpDown, Info, ChevronRight, X, Sparkles, MessageCircle } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Product, Review } from '../db/mockDb';
import { aiEngine } from '../services/aiEngine';
import type { RecommendationResult } from '../services/aiEngine';

interface ProductStoreProps {
  onAddToCart: (product: Product, quantity: number) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  setWhatsAppContext: (product: { title: string } | undefined) => void;
}

export const ProductStore: React.FC<ProductStoreProps> = ({
  onAddToCart,
  selectedProduct,
  setSelectedProduct,
  setWhatsAppContext,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [aiResults, setAiResults] = useState<RecommendationResult[]>([]);
  const [aiExplanation, setAiExplanation] = useState('');

  // Details Modal States
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Add Review Form
  const [reviewerName, setReviewerName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prods = await db.fetchProducts();
        if (!mounted) return;
        setProducts(prods || db.getProducts());
      } catch (e) {
        setProducts(db.getProducts());
      }
    })();
    return () => { mounted = false; };
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setReviews(db.getReviews(selectedProduct.id));
      setQuantity(1);
      setActiveTab('specs');
      setWhatsAppContext({ title: selectedProduct.title });
    } else {
      setWhatsAppContext(undefined);
    }
  }, [selectedProduct]);

  // Categories list
  const categories = ['All', 'Laptops', 'Servers', 'CCTV & Security', 'Networking'];
  
  // Brands list
  const brands = ['All', 'Dell', 'Lenovo', 'HP', 'Hikvision', 'CP Plus', 'Cisco', 'Ubiquiti'];

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      setIsAiSearch(false);
      (async () => setProducts(await db.fetchProducts()))();
      return;
    }

    if (isAiSearch) {
      // Trigger Semantic Vector Search Simulation
      const results = aiEngine.semanticSearch(searchQuery);
      setAiResults(results);
      
      const solver = aiEngine.getRecommendationForPrompt(searchQuery);
      setAiExplanation(solver.explanationText);
    }
  };

  // Run auto-search whenever query or isAiSearch changes to make it responsive
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setIsAiSearch(false);
      (async () => setProducts(await db.fetchProducts()))();
      return;
    }

    if (isAiSearch) {
      const results = aiEngine.semanticSearch(searchQuery);
      setAiResults(results);
      const solver = aiEngine.getRecommendationForPrompt(searchQuery);
      setAiExplanation(solver.explanationText);
    }
  }, [searchQuery, isAiSearch]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !reviewerName.trim() || !reviewComment.trim()) return;

    db.addReview(selectedProduct.id, reviewerName, reviewRating, reviewComment);
    setReviews(db.getReviews(selectedProduct.id));
    setReviewerName('');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Filter regular products list (non-AI search mode)
  const filteredProducts = products.filter(prod => {
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || prod.brand === selectedBrand;
    const matchesSearch = searchQuery.trim() === '' || 
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.brand.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesBrand && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // Default popularity / position
  });

  const openWhatsAppInquiry = (title: string, quantityValue = 1) => {
    const message = `Hello, I would like to enquire about "${title}". Quantity: ${quantityValue}. Please share the next steps.`;
    window.open(`https://wa.me/${db.getSupportPhone()}?text=${encodeURIComponent(message)}`, '_blank', 'noreferrer');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-heading font-bold text-slate-900 flex items-center space-x-2">
            <span>Enterprise Systems & Store</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Configure, compare, and request quotes on commercial business hardware.
          </p>
        </div>

        {/* Search Engine Selector */}
        <form onSubmit={handleSearch} className="relative flex items-center w-full md:max-w-xl">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAiSearch ? "Try 'portable programming laptop under 1 lakh'..." : "Search model, brand or spec..."}
              className="w-full bg-white border border-slate-200 rounded-l-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          </div>
          <button
            type="button"
            onClick={() => setIsAiSearch(!isAiSearch)}
            className={`px-4 py-3 text-xs font-bold rounded-r-xl border border-l-0 border-white/10 flex items-center space-x-1.5 transition-colors ${
              isAiSearch 
                ? 'bg-primary-600 hover:bg-primary-500 text-white glow-primary border-primary-500' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Search</span>
          </button>
        </form>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setIsAiSearch(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedCategory === cat && !isAiSearch
                ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/20'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-heading font-semibold text-slate-900 text-sm flex items-center space-x-2">
                <Filter className="w-4 h-4 text-primary-400" />
                <span>Filter Inventory</span>
              </h3>
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSortBy('popularity');
                  setSearchQuery('');
                  setIsAiSearch(false);
                }}
                className="text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Manufacturer</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block flex items-center space-x-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort Sequence</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-primary-500"
              >
                <option value="popularity">Standard Matching</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Security Tip */}
            <div className="bg-primary-950/20 border border-primary-500/10 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
              <div className="flex items-center space-x-1.5 text-primary-400 font-semibold mb-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>B2B Supply Terms</span>
              </div>
              Bulk quantities and custom specifications can be booked directly through our sales engineers via the floating WhatsApp widget.
            </div>
          </div>
        </aside>

        {/* Catalog Grid Area */}
        <main className="lg:col-span-3">
          {isAiSearch ? (
            /* AI Semantic Vector Search Results view */
            <div className="space-y-6 text-left">
              {/* AI Engine Status Alert */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-primary-600/20 to-transparent -z-10 rounded-full blur-xl"></div>
                <div className="flex items-center space-x-2 text-primary-400 font-heading font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-primary-300" />
                  <span>FastAPI Embedding Vector Match Status</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                  {aiExplanation}
                </p>
                <div className="text-[10px] text-slate-500 font-semibold bg-slate-50 p-2 rounded inline-block border border-slate-200">
                  Simulating cosine similarity on 384-dimensional vector weights
                </div>
              </div>

              {/* Scored product list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiResults.map(res => (
                  <div
                    key={res.product.id}
                    onClick={() => setSelectedProduct(res.product)}
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video relative overflow-hidden bg-slate-100">
                        <img src={res.product.images[0]} alt={res.product.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-primary-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {(res.score * 100).toFixed(1)}% Match
                        </span>
                      </div>
                      
                      <div className="p-5 space-y-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{res.product.brand}</span>
                          <h3 className="font-heading font-semibold text-base text-slate-900 mt-1 group-hover:text-primary-400 transition-colors">
                            {res.product.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{res.product.description}</p>
                        
                        {/* Cosine similarity text */}
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed mt-2 italic">
                          <span className="text-primary-400 font-semibold not-italic">AI explanation: </span>
                          "{res.explanation}"
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-200 mt-4">
                      <span className="text-xs text-slate-500 font-bold">Request on WhatsApp</span>
                      <span className="text-xs text-primary-400 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Configure</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {aiResults.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
                  <p>No inventory matched your semantic request. Try widening your search query.</p>
                </div>
              )}
            </div>
          ) : (
            /* Regular Filterable Products view */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className="glass-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="aspect-video relative overflow-hidden bg-slate-100">
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-white border border-slate-200 text-slate-800 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {prod.category}
                        </span>
                        
                        {prod.stock === 0 ? (
                          <span className="absolute bottom-3 right-3 bg-red-600/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg">
                            Out of Stock
                          </span>
                        ) : prod.stock <= 5 ? (
                          <span className="absolute bottom-3 right-3 bg-amber-600/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg">
                            Only {prod.stock} Left
                          </span>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="p-5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-widest text-primary-400">{prod.brand}</span>
                          <div className="flex items-center space-x-0.5 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-bold text-slate-300">{prod.rating}</span>
                          </div>
                        </div>
                        <h3 className="font-heading font-semibold text-sm sm:text-base text-slate-900 group-hover:text-primary-500 transition-colors line-clamp-1">
                          {prod.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-200 mt-3">
                      <span className="text-xs font-bold text-slate-500">Request on WhatsApp</span>
                      <button className="text-xs font-bold text-primary-400 group-hover:text-white transition-colors flex items-center space-x-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
                  <p className="font-semibold text-lg text-slate-900 mb-2">No matching hardware found</p>
                  <p className="text-sm">Try clearing filters or search variables to restore catalog listing.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Close */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-full hover:scale-105 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Left Side: Images & Action */}
              <div className="space-y-4 text-left">
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.title}
                  className="w-full aspect-video rounded-xl object-cover border border-slate-200"
                />
                
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{selectedProduct.brand}</span>
                  <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 mt-1 leading-tight">{selectedProduct.title}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(selectedProduct.rating) ? 'fill-current' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">{selectedProduct.rating} / 5</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                
                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-semibold">WhatsApp quote:</span>
                    <span className="text-sm font-semibold text-slate-900">Request now</span>
                  </div>

                  {selectedProduct.stock > 0 ? (
                    <div className="flex items-center space-x-4">
                      {/* Quantity */}
                      <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-2.5 py-2 font-bold text-slate-400 hover:text-slate-900"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                        <button
                          onClick={() => setQuantity(q => Math.min(selectedProduct.stock, q + 1))}
                          className="px-2.5 py-2 font-bold text-slate-400 hover:text-slate-900"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          onAddToCart(selectedProduct, quantity);
                          openWhatsAppInquiry(selectedProduct.title, quantity);
                          setSelectedProduct(null);
                        }}
                        className="flex-1 py-3 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl text-xs font-bold transition-all shadow-lg glow-primary"
                      >
                        Send on WhatsApp
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-950/20 border border-red-500/10 rounded-xl p-3 text-center text-xs text-red-400 font-semibold">
                      Currently Out of Stock. Supply query queue can be initiated on WhatsApp.
                    </div>
                  )}

                  {/* WhatsApp Quick Chat */}
                  <a
                    href={`https://wa.me/${db.getSupportPhone()}?text=${encodeURIComponent(`Hello, I am interested in the "${selectedProduct.title}". Please share availability and next steps.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
                        <span>Inquire via WhatsApp Business</span>
                  </a>
                </div>
              </div>

              {/* Right Side: Specs & Reviews Tabs */}
              <div className="text-left flex flex-col justify-between">
                <div>
                  {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-4 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('specs')}
                      className={`pb-3 px-1 border-b-2 transition-all ${
                        activeTab === 'specs' ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-400'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-3 px-1 border-b-2 ml-6 transition-all ${
                        activeTab === 'reviews' ? 'border-primary-500 text-slate-900' : 'border-transparent text-slate-400'
                      }`}
                    >
                      Customer Reviews ({reviews.length})
                    </button>
                  </div>

                  {activeTab === 'specs' ? (
                    <div className="overflow-y-auto max-h-[300px] border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-xs text-left border-collapse">
                        <tbody>
                          {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="p-3 font-semibold text-slate-500 w-1/3">{key}</td>
                              <td className="p-3 text-slate-700">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                      {/* Reviews List */}
                      <div className="space-y-3">
                        {reviews.map(rev => (
                          <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900">{rev.userName}</span>
                              <div className="flex items-center text-amber-400">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="text-[10px] text-slate-300 font-bold ml-0.5">{rev.rating}</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-300 italic">"{rev.comment}"</p>
                            <p className="text-[9px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                        {reviews.length === 0 && (
                          <p className="text-xs text-slate-500 text-center py-6">No client reviews registered for this product.</p>
                        )}
                      </div>

                      {/* Add Review Form */}
                      <form onSubmit={handleAddReview} className="border-t border-slate-200 pt-4 space-y-3">
                        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Submit Review</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Name / Title"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            required
                            className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                          />
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(parseInt(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-primary-500"
                          >
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Your review comment..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-primary-500 resize-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-[11px] font-semibold transition-all"
                        >
                          Submit Review
                        </button>
                        {reviewSuccess && <span className="text-[10px] text-green-400 ml-3">Review approved & queued.</span>}
                      </form>
                    </div>
                  )}
                </div>

                {/* Simulated pgvector representation */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 mt-4">
                  <div className="flex items-center space-x-1 text-primary-400 font-semibold text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-primary-300" />
                    <span>PostgreSQL pgvector Embedding</span>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 break-all bg-slate-50 p-2 rounded border border-slate-200">
                    [{selectedProduct.embedding.map(v => v.toFixed(2)).join(', ')}]
                  </div>
                  <p className="text-[9px] text-slate-500">
                    High similarity on vector indices yields superior chatbot relevance recommendations.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

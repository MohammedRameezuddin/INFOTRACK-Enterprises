import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppCTA } from './components/WhatsAppCTA';
import { AIChatbot } from './components/AIChatbot';
import { LandingPage } from './components/LandingPage';
import { ProductStore } from './components/ProductStore';
import { ServiceBooking } from './components/ServiceBooking';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CartDrawer } from './components/CartDrawer';
import { StoriesBar } from './components/StoriesBar';
import { StoriesViewer } from './components/StoriesViewer';
import { StoryAdmin } from './components/StoryAdmin';
import { db } from './db/mockDb';
import type { Product, User } from './db/mockDb';

interface CartItem {
  product: Product;
  quantity: number;
}

function App() {
  const [currentView, setView] = useState<string>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Stories state
  const [activeStories, setActiveStories] = useState(db.getActiveStories());
  const [storyViewerIndex, setStoryViewerIndex] = useState<number | null>(null);

  // WhatsApp Context state
  const [whatsAppContext, setWhatsAppContext] = useState<{
    product?: { title: string };
    service?: { title: string };
  }>({});

  // Sync current user with mockDb
  useEffect(() => {
    db.setCurrentUser(currentUser);
  }, [currentUser]);

  // Handle adding items to cart
  const handleAddToCart = (product: Product, quantity = 1) => {
    setWhatsAppContext({ product: { title: product.title } });
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Limit quantity to stock
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
    
    // Automatically open the cart for immediate feedback
    setIsCartOpen(true);
  };

  // Toggle user roles for Clerk mock testing
  const handleRoleSwitch = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      const adminUser: User = {
        id: 'user-admin',
        name: 'Infotrack Admin Solutions',
        email: 'admin@infotrack.in',
        phone: '+91 40 4821 9900',
        role: 'admin',
        created_at: '2026-01-01T00:00:00Z',
      };
      setCurrentUser(adminUser);
      setView('admin'); // Automatically switch view to admin panel
    } else {
      const customerUser: User = {
        id: 'user-cust',
        name: 'Jane Smith',
        email: 'jane@enterprise.com',
        phone: '+91 98765 43210',
        role: 'customer',
        created_at: '2026-01-01T00:00:00Z',
      };
      setCurrentUser(customerUser);
      setView('portal'); // Go to portal
    }
  };

  // Cart total count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-primary-500/30 selection:text-slate-900">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setView={(v) => {
          setView(v);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Stories Bar */}
      <StoriesBar
        onOpenStory={(index) => setStoryViewerIndex(index)}
        onView={setView}
      />

      {/* Main Pages */}
      <main className="flex flex-col">
        {currentView === 'home' && (
          <LandingPage
            setView={setView}
            setSelectedProduct={(p) => {
              setSelectedProduct(p);
              setView('store');
            }}
          />
        )}

        {currentView === 'store' && (
          <ProductStore
            onAddToCart={handleAddToCart}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            setWhatsAppContext={(product) => setWhatsAppContext(product ? { product } : {})}
          />
        )}

        {currentView === 'services' && (
          <ServiceBooking
            currentUser={currentUser}
            setView={setView}
            setWhatsAppContext={(service) => setWhatsAppContext(service ? { service } : {})}
          />
        )}

        {currentView === 'portal' && (
          <CustomerPortal
            currentUser={currentUser}
            setView={setView}
          />
        )}

        {currentView === 'admin' && (
          currentUser.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AdminLogin
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setView('admin');
              }}
              onCancel={() => setView('home')}
            />
          )
        )}

        {currentView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setView('admin');
            }}
            onCancel={() => setView('home')}
          />
        )}

        {currentView === 'stories-admin' && (
          <StoryAdmin setView={setView} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Floating Widgets */}
      <WhatsAppCTA
        activeProduct={whatsAppContext.product}
        activeService={whatsAppContext.service}
      />
      
      <AIChatbot
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        currentUser={currentUser}
        setView={setView}
      />

      {/* Stories Viewer Overlay */}
      {storyViewerIndex !== null && activeStories.length > 0 && (
        <StoriesViewer
          stories={activeStories}
          initialIndex={storyViewerIndex}
          onClose={() => {
            setStoryViewerIndex(null);
            // Refresh stories after viewing (view counts updated)
            setActiveStories(db.getActiveStories());
          }}
          onView={(v) => {
            setStoryViewerIndex(null);
            setView(v);
            setActiveStories(db.getActiveStories());
          }}
        />
      )}
    </div>
  );
}

export default App;

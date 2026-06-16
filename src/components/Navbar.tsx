import React, { useState, useEffect } from 'react';
import { ShoppingCart, ShieldAlert, CircleDot } from 'lucide-react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/clerk-react';
import type { User as UserType } from '../db/mockDb';
import { Logo } from './Logo';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  openCart: () => void;
  currentUser: UserType;
  onRoleSwitch: (role: 'customer' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setView,
  cartCount,
  openCart,
  currentUser,
  onRoleSwitch,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
      isScrolled 
        ? 'glass shadow-lg border-white/10' 
        : 'bg-transparent border-transparent'
    }`}>
      {/* Scroll Progress Indicator Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary-400 to-electric transition-all duration-100 ease-out z-50"
        style={{ width: `${scrollProgress}%` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
        }`}>
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('home')}>
            <Logo size={36} />
            <div>
              <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-slate-900 block leading-none">
                INFOTRACK
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400 block mt-0.5">
                Enterprises
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
              {[
              { id: 'home', label: 'Home' },
              { id: 'store', label: 'Store' },
              { id: 'services', label: 'Services' },
              { id: 'portal', label: 'Client Portal' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  currentView === item.id
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setView('stories-admin')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                currentView === 'stories-admin'
                  ? 'text-slate-900 bg-slate-100 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CircleDot className="w-4 h-4 text-pink-500" />
              <span>Stories</span>
            </button>
            <button
              onClick={() => setView(currentUser.role === 'admin' ? 'admin' : 'admin-login')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                currentView === 'admin' || currentView === 'admin-login'
                  ? 'text-slate-900 bg-slate-100 border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-primary-500" />
              <span>Admin Panel</span>
            </button>
          </nav>

          {/* Right Section Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser.role === 'admin' && (
              <button
                onClick={() => onRoleSwitch('customer')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                title="Log out of Admin Account"
              >
                <span>Exit Admin</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-gradient-to-tr from-primary-600 to-electric text-white text-[11px] font-bold rounded-full border-2 border-navy-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Clerk Auth Controls */}
            <SignedOut>
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-2 sm:pl-4">
                <SignInButton mode="modal">
                  <button className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-all shadow-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center space-x-2 border-l border-slate-200 pl-2 sm:pl-4">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8',
                    },
                  }}
                  showName
                  userProfileProps={{
                    appearance: {
                      elements: {
                        rootBox: 'z-[100]',
                      },
                    },
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
          <div className="md:hidden flex items-center justify-center space-x-1 py-2 border-t border-slate-200 overflow-x-auto">
          {[
            { id: 'home', label: 'Home' },
            { id: 'store', label: 'Store' },
            { id: 'services', label: 'Services' },
            { id: 'portal', label: 'Portal' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                currentView === item.id
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setView('stories-admin')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
              currentView === 'stories-admin'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setView(currentUser.role === 'admin' ? 'admin' : 'admin-login')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
              currentView === 'admin' || currentView === 'admin-login'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Admin Panel
          </button>
        </div>
      </div>
    </header>
  );
};

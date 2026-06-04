import React, { useState } from 'react';
import { Shield, Mail, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../db/mockDb';
import type { User } from '../db/mockDb';
import { Logo } from './Logo';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate network authentication delay
    setTimeout(() => {
      const user = db.authenticateAdmin(email.trim(), password);
      setIsSubmitting(false);

      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Invalid administrative credentials. Access denied.');
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[70vh] relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-600/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 text-left relative">
        {/* Back */}
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center pb-2">
            <Logo size={48} />
          </div>
          <h2 className="font-heading font-bold text-2xl text-slate-900">Administrative Portal</h2>
          <p className="text-xs text-slate-400">Authenticating database administrative access</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@infotrack.in"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-electric transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Security Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-electric transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Access...</span>
              </>
            ) : (
              <span>Verify credentials</span>
            )}
          </button>
        </form>

        {/* Credentials guide block */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-[10px] text-slate-500 leading-relaxed text-center shadow-sm">
          <p className="font-semibold text-slate-600 mb-1">🔑 Default Workspace Admin Credentials:</p>
          <p>Email: <span className="text-primary-600 font-bold">admin@infotrack.in</span></p>
          <p>Password: <span className="text-primary-600 font-bold">InfotrackAdmin2026!</span></p>
        </div>
      </div>
    </div>
  );
};

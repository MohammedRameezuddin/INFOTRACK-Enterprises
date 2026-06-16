import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'

// Clerk publishable key from environment
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
}

// Ensure body doesn't keep dark Tailwind utilities at runtime (dev HMR or cached HTML)
(() => {
  try {
    const keep = ['antialiased', 'font-sans'];
    const parts = (document.body.className || '').split(/\s+/).filter(Boolean);
    const filtered = parts.filter(p => !p.startsWith('bg-') && !p.startsWith('text-') && !p.startsWith('from-') && !p.startsWith('to-'));
    const finalCls = Array.from(new Set(filtered.concat(keep).concat(['bg-white', 'text-slate-900']))).join(' ');
    document.body.className = finalCls;
  } catch (e) {
    // ignore in non-browser environments
  }
})();

// Re-apply after a short delay to defeat HMR/client script overrides
setTimeout(() => {
  try {
    const parts = (document.body.className || '').split(/\s+/).filter(Boolean);
    const filtered = parts.filter(p => !p.startsWith('bg-') && !p.startsWith('text-') && !p.startsWith('from-') && !p.startsWith('to-'));
    const finalCls = Array.from(new Set(filtered.concat(['antialiased','font-sans','bg-white','text-slate-900']))).join(' ');
    document.body.className = finalCls;
  } catch (e) {}
}, 300);

// Force inline background + color (highest priority) to guarantee white theme
try {
  document.body.style.setProperty('background-color', '#ffffff', 'important');
  document.body.style.setProperty('color', '#0f172a', 'important');
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>,
)

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Server, ShieldCheck, Zap, Network, Video, Star, Play, Pause, X, Volume2, VolumeX, Maximize, Minimize, RotateCcw, RotateCw, ChevronDown, ChevronUp, ArrowUp, Phone, CheckCircle2 } from 'lucide-react';
import heroPreview from '../assets/hero.png';
import { db } from '../db/mockDb';
import type { Product } from '../db/mockDb';

// 1. Reusable Scroll Reveal Animation Component (Intersection Observer based)
const ScrollReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Trigger animation once
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
};

// 2. Reusable Stats Count-up Animator (Triggers when scrolled into view)
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string; prefix?: string; divisor?: number }> = ({ end, duration = 1500, suffix = '', prefix = '', divisor = 1 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !started) {
          started = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(progress * end);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(elementRef.current);
      }
    };
  }, [end, duration]);

  const displayValue = divisor > 1 ? (count / divisor).toFixed(1) : Math.floor(count).toString();

  return <span ref={elementRef}>{prefix}{displayValue}{suffix}</span>;
};

// 3. Sub-component for FAQ accordion item to adhere to hook rules
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-slate-900 text-sm sm:text-base hover:bg-slate-50 transition-colors"
      >
        <span>{q}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-primary-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <div 
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[300px] border-t border-slate-200 px-6 py-4 bg-slate-50' : 'max-h-0'
        }`}
      >
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{a}</p>
      </div>
    </div>
  );
};

interface LandingPageProps {
  setView: (view: string) => void;
  setSelectedProduct: (product: Product) => void;
}

type SolutionTab = 'AMC' | 'Installation' | 'Consultation' | 'Support';

export const LandingPage: React.FC<LandingPageProps> = ({ setView, setSelectedProduct }) => {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>(() => db.getProducts().slice(0, 3));
  const [services, setServices] = React.useState(() => db.getServices());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prods = await db.fetchProducts();
        if (!mounted) return;
        setFeaturedProducts((prods || []).slice(0, 3));
      } catch {
        /* ignore, fallback already set */
      }

      try {
        const svcs = await db.fetchServices();
        if (!mounted) return;
        setServices(svcs || db.getServices());
      } catch {
        /* ignore */
      }
    })();
    return () => { mounted = false; };
  }, []);
  const introVideoUrl = db.getIntroVideoUrl();

  const [isLoaded, setIsLoaded] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoLoadError, setVideoLoadError] = useState(false);
  const [resolvedIntroVideoUrl, setResolvedIntroVideoUrl] = useState(introVideoUrl);
  const [showBrochureLightbox, setShowBrochureLightbox] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  // Solutions tab state
  const [activeTab, setActiveTab] = useState<SolutionTab>('AMC');

  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  const brochureHighlights = [
    {
      title: 'Trusted IT Partner',
      description: 'Reliable long-term partnership for businesses that need ongoing support, delivery, and service response.',
    },
    {
      title: 'Quality Assured',
      description: 'Tested, verified, and value-focused supply of branded products with installation support.',
    },
    {
      title: 'Customer Focused',
      description: 'Service-first workflows built around satisfaction, uptime, and practical business needs.',
    },
    {
      title: 'Reliable Solutions',
      description: 'Practical IT solutions covering hardware, office infrastructure, and maintenance contracts.',
    },
  ];

  const whatWeOffer = [
    'New Branded Laptops',
    'Used & Refurbished Laptops',
    'Desktop Computers',
    'All-in-One PCs',
    'LED Monitors',
    'Interactive Panels',
    'Projectors',
    'CCTV Solutions',
    'Printers & Scanners',
    'Networking Products',
    'Computer Accessories',
    'RAM & SSD Upgrades',
    'Laptop & Desktop Repairs',
  ];

  const coreServices = [
    'On-site IT Support',
    'Network Design & Maintenance',
    'Hardware Sales & Support',
    'Website Design & Hosting',
    'Data Backup & Recovery',
    'Cloud Backup Services',
    'IT Infrastructure Solutions',
    'IT Security Solutions',
    'Microsoft Windows Licensing',
    'Windows Server Licensing',
    'Software Installation & Support',
    'AMC & Maintenance Services',
  ];

  const serveSegments = [
    'Small Businesses',
    'Offices',
    'Institutions',
    'Retail Stores',
    'Industries',
    'Home Users',
  ];

  const trustedBrands = [
    'Dell',
    'HP',
    'Lenovo',
    'Asus',
    'Intel',
    'Microsoft',
    'Cisco',
    'Epson',
    'Hikvision',
    'Samsung',
  ];

  // Trigger Sequenced Hero load transition
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Listen to window scroll to toggle scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openIntroModal = () => {
    setVideoLoadError(false);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setShowIntroModal(true);
  };

  const openBrochureLightbox = () => {
    setShowBrochureLightbox(true);
  };

  const closeBrochureLightbox = () => {
    setShowBrochureLightbox(false);
  };

  // Sync volume and mute properties directly with the video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, showIntroModal]);

  // Lock body scroll and trigger autoplay when modal opens
  useEffect(() => {
    if (showIntroModal) {
      document.body.style.overflow = 'hidden';
      // Auto-play attempt
      const timer = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(err => {
            console.log("Autoplay blocked, waiting for user action:", err);
          });
        }
      }, 300);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showIntroModal]);

  useEffect(() => {
    let isCancelled = false;
    let objectUrl: string | null = null;

    if (!/^https?:\/\//i.test(introVideoUrl)) {
      return () => undefined;
    }

    (async () => {
      try {
        const response = await fetch(introVideoUrl, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`Failed to load intro video: ${response.status}`);
        }

        const blob = await response.blob();
        if (isCancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setResolvedIntroVideoUrl(objectUrl);
      } catch {
        if (!isCancelled) {
          setResolvedIntroVideoUrl(introVideoUrl);
        }
      }
    })();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [introVideoUrl]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show/hide controls with mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    if (!isPlaying && controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => console.log("Play failed:", err));
      setIsPlaying(true);
    }
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const closeModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    setShowIntroModal(false);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 space-y-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden mx-4 sm:mx-6 lg:mx-8 mt-6 rounded-3xl border border-slate-200 bg-white pt-20 pb-16 sm:pt-28 sm:pb-24 shadow-xl">
        {/* Background Video Loop */}
        <video 
          src={resolvedIntroVideoUrl} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-55 scale-105 pointer-events-none z-0"
        />

        {/* Radial masks & glow meshes */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/55 to-white/80 pointer-events-none z-0"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 z-10">
          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-primary-600 font-semibold tracking-wide animate-pulse transition-all duration-700 transform shadow-sm ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Zap className="w-3.5 h-3.5 text-primary-500" />
            <span>FastAPI AI & pgvector Embedding Search Integrated</span>
          </div>

          <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1] transition-all duration-1000 delay-150 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            INFOTRACK Enterprise <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-500 to-electric-light">IT Solutions & Hardware</span>
          </h1>

          <p className={`text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            INFOTRACK ENTERPRISES supplies startup-grade and enterprise-scalable hardware, security surveillance setups, and custom IT support contracts designed for maximum operational uptime.
          </p>

          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 transition-all duration-1000 delay-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button
              onClick={() => setView('store')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-tr from-primary-600 to-electric hover:from-primary-500 hover:to-electric-light text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg glow-primary transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Explore Enterprise Store</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('services')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-bold transition-all duration-300 shadow-sm"
            >
              Book Service Audit
            </button>
            <button
              onClick={openIntroModal}
              className="w-full sm:w-auto px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 group shadow-sm"
            >
              <Play className="w-4.5 h-4.5 text-primary-400 fill-current group-hover:scale-110 transition-transform" />
              <span>Play Intro Video</span>
            </button>
          </div>

          {/* Infinite Brands Marquee */}
          <div className={`pt-12 sm:pt-16 border-t border-slate-200 max-w-5xl mx-auto overflow-hidden transition-all duration-1000 delay-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-6 text-center">
              Authorized Supply & Enterprise Deployment Partner
            </p>
            <div className="relative w-full overflow-hidden py-2 mask-marquee">
              <div className="flex w-[200%] animate-marquee hover:[animation-play-state:paused] space-x-12 sm:space-x-16 items-center justify-start">
                {/* Track 1 */}
                {[
                  'DELL ENTERPRISE', 'CISCO SYSTEMS', 'LENOVO BUSINESS', 'HIKVISION SECURITY',
                  'CP PLUS SMART', 'SOPHOS FIREWALLS', 'FORTINET NETWORKS', 'UBIQUITI UNIFI'
                ].map((brand, idx) => (
                  <span key={`b1-${idx}`} className="font-heading font-bold text-sm sm:text-base text-slate-400 tracking-wider hover:text-primary-400 transition-colors cursor-pointer select-none whitespace-nowrap">
                    {brand}
                  </span>
                ))}
                {/* Track 2 (Duplicate for seamless marquee loop) */}
                {[
                  'DELL ENTERPRISE', 'CISCO SYSTEMS', 'LENOVO BUSINESS', 'HIKVISION SECURITY',
                  'CP PLUS SMART', 'SOPHOS FIREWALLS', 'FORTINET NETWORKS', 'UBIQUITI UNIFI'
                ].map((brand, idx) => (
                  <span key={`b2-${idx}`} className="font-heading font-bold text-sm sm:text-base text-slate-400 tracking-wider hover:text-primary-400 transition-colors cursor-pointer select-none whitespace-nowrap">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Play Intro preview card */}
        <div 
          onClick={openIntroModal}
          className={`absolute bottom-6 right-6 hidden lg:flex items-center space-x-4 bg-white p-3 rounded-2xl border border-slate-200 hover:border-primary-300 hover:bg-slate-50 transition-all duration-1000 delay-1000 transform shadow-xl group cursor-pointer z-20 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
        >
          <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
            <video 
              src={resolvedIntroVideoUrl} 
              muted 
              loop 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover opacity-60" 
            />
          </div>
          <div className="text-left pr-2">
            <p className="text-xs font-bold text-slate-900 leading-none">Play Intro Video</p>
            <p className="text-[10px] text-slate-400 mt-1">Watch cinematic tour</p>
          </div>
        </div>
      </section>

      {/* Cinematic Brand Film section removed per request */}

      {/* Business Profile Showcase */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-white to-electric/5 pointer-events-none" />
          <div className="relative p-6 sm:p-10 lg:p-12 space-y-10">
            <div className="max-w-3xl space-y-3">
              <p className="text-[10px] uppercase font-bold tracking-[0.35em] text-primary-500">Business Profile</p>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900">A clear view of the actual products, services, and customers served.</h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                This section keeps the brochure information accurate and organized: what is sold, what services are offered, who is served, and how the business supports customers.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                <button
                  type="button"
                  onClick={openBrochureLightbox}
                  className="group relative block aspect-[4/3] w-full overflow-hidden text-left cursor-zoom-in"
                >
                  <img
                    src={heroPreview}
                    alt="Infotrack enterprise brochure preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                  <div className="absolute left-4 bottom-4 right-4 text-white">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/70">Brochure Overview</p>
                    <h3 className="text-2xl font-heading font-bold mt-1">New & used IT products with support services.</h3>
                  </div>
                  <div className="absolute inset-0 ring-0 ring-inset ring-transparent group-hover:ring-2 group-hover:ring-white/80 transition-all"></div>
                </button>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brochureHighlights.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm text-left">
                    <h3 className="font-heading font-bold text-lg text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm">
                <h3 className="font-heading font-bold text-slate-900 text-base mb-4">What We Offer</h3>
                <ul className="space-y-2">
                  {whatWeOffer.map((item) => (
                    <li key={item} className="flex items-start space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm">
                <h3 className="font-heading font-bold text-slate-900 text-base mb-4">Core Services</h3>
                <ul className="space-y-2">
                  {coreServices.map((item) => (
                    <li key={item} className="flex items-start space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left shadow-sm">
                <h3 className="font-heading font-bold text-slate-900 text-base mb-4">Who We Serve</h3>
                <ul className="space-y-2">
                  {serveSegments.map((item) => (
                    <li key={item} className="flex items-start space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-electric shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="font-heading font-bold text-slate-900 text-base">Trusted Brands</h3>
                <p className="text-xs text-slate-500">Dell, HP, Lenovo, Asus, Intel, Microsoft, Cisco, Epson, Hikvision, Samsung</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {trustedBrands.map((brand) => (
                  <div key={brand} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700">
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Counter Section */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {[
            { end: 500, suffix: '+', label: 'Enterprise Clients' },
            { end: 15, prefix: '₹', suffix: 'Cr+', divisor: 10, label: 'Hardware Deployed' },
            { end: 998, suffix: '%', divisor: 10, label: 'SLA Support Uptime' },
            { end: 5, suffix: '★', label: 'Client Satisfaction' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-1 sm:space-y-2 border-r border-slate-200 last:border-0">
              <p className="text-2xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900">
                <CountUp end={stat.end} suffix={stat.suffix} prefix={stat.prefix} divisor={stat.divisor} />
              </p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* IT Solutions Explorer (Filterable Showcase Tabs) */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold">IT Solutions Explorer</h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Scale your workplace digital systems with SLA-backed engineering support. Use the interactive filters to explore our core solutions.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center flex-wrap gap-2 pb-4">
          {[
            { id: 'AMC', label: 'AMC Contracts', icon: Server },
            { id: 'Installation', label: 'Surveillance & Setup', icon: Video },
            { id: 'Consultation', label: 'Network Design', icon: Network },
            { id: 'Support', label: 'IT Support & Backups', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SolutionTab)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-tr from-primary-600 to-electric text-white shadow-lg glow-primary' 
                    : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.filter(serv => serv.category === activeTab).map(serv => {
            const Icon = serv.category === 'AMC' ? Server 
                       : serv.category === 'Installation' ? Video 
                       : serv.category === 'Consultation' ? Network 
                       : ShieldCheck;

            return (
              <div key={serv.id} className="bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-3xl overflow-hidden flex flex-col h-full hover:border-primary-300 transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img src={serv.imageUrl} alt={serv.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/15 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 bg-primary-600 p-2.5 rounded-xl text-white shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-6 text-left">
                  <div className="space-y-3">
                    <h3 className="font-heading font-bold text-lg text-slate-900 leading-tight">{serv.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{serv.description}</p>
                    
                    {/* Key features bullets */}
                    <ul className="space-y-1.5 pt-2">
                      {serv.features.slice(0, 3).map((feat, fidx) => (
                        <li key={fidx} className="flex items-start space-x-1.5 text-[11px] text-slate-300 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <p className="text-sm font-extrabold text-primary-600">{serv.priceEstimate}</p>
                    <button
                      onClick={() => setView('services')}
                      className="w-full py-2.5 bg-slate-50 hover:bg-primary-600 hover:text-white border border-slate-200 hover:border-primary-600 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Book Service Call
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Onsite Deployment Methodology */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold">Our On-Site Deployment Methodology</h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            A systematic, high-uptime approach to enterprise hardware provisioning and service execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line on desktop */}
          <div className="hidden md:block absolute top-[36px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary-500 to-electric-light -z-10"></div>
          
          {[
            {
              step: '01',
              title: 'Infrastructure Audit',
              desc: 'We perform a complete site survey of your current networking topology, wiring quality, and system load constraints.'
            },
            {
              step: '02',
              title: 'Architecture Design',
              desc: 'Our senior consultants draft custom server configurations, CCTV placement maps, and SLA uptime contracts.'
            },
            {
              step: '03',
              title: 'Precision Deployment',
              desc: 'Infotrack engineers install hardware, route structured cabling, and setup firewall gateway configurations.'
            },
            {
              step: '04',
              title: '24/7 SLA Support',
              desc: 'Enjoy peace of mind with continuous remote patching, regular onsite checkups, and rapid troubleshooting AMC.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-6 rounded-3xl transition-all shadow-sm hover:shadow-md group text-left space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-electric text-white font-heading font-extrabold flex items-center justify-center text-base shadow-md group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base group-hover:text-primary-600 transition-colors pt-2">{item.title}</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Featured Products */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold">Featured Enterprise Inventory</h2>
            <p className="text-sm text-slate-400">Shop top-tier brand solutions with full manufacturer warranties.</p>
          </div>
          <button
            onClick={() => setView('store')}
            className="flex items-center space-x-1 text-sm font-semibold text-primary-600 hover:text-slate-900 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map(prod => (
            <div
              key={prod.id}
              onClick={() => {
                setSelectedProduct(prod);
                setView('store'); // Opens store and triggers detail view
              }}
              className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {prod.category}
                </span>
              </div>
              <div className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">{prod.brand}</span>
                    <div className="flex items-center space-x-0.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-slate-300">{prod.rating}</span>
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                    {prod.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{prod.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xl font-heading font-bold text-slate-900">₹{prod.price.toLocaleString('en-IN')}</p>
                  <span className="text-xs font-semibold text-primary-400 group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Testimonials section */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold">Trusted by Operations Heads</h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">See how we resolve business hardware supply challenges.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[
            {
              quote: "Infotrack handled our complete corporate migration at T-Hub. From network cabling audits to supplying 30+ Latitude laptops, their engineers delivered ahead of schedule. The WhatsApp support channel is extremely convenient.",
              author: "N. Venkatesh",
              role: "Head of Infrastructure, TechLogix Private Limited",
              rating: 5
            },
            {
              quote: "We signed an AMC for our warehouse network and security cameras in Vijayawada. The monthly preventative visits and rapid support response saved us hours of network downtime. Genuinely professional IT partner.",
              author: "P. Srinivasa Rao",
              role: "Director of Supply Chain, Andhra Logistics Hub",
              rating: 5
            }
          ].map((test, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-left relative shadow-sm">
              <div className="flex items-center space-x-0.5 text-amber-400">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-slate-600 italic leading-relaxed">"{test.quote}"</p>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-primary-600">
                  {test.author[0]}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 leading-none">{test.author}</h4>
                  <p className="text-xs text-slate-500 mt-1">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Director & Contact Section */}
      <ScrollReveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden text-left shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary-600 to-electric text-white font-heading font-extrabold flex items-center justify-center text-3xl shadow-xl glow-primary shrink-0 uppercase">
              {db.getDirectorName().split(' ').pop()?.[0] || 'D'}
            </div>
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400 bg-primary-400/10 px-3.5 py-1.5 rounded-full border border-primary-500/20 inline-block font-semibold">
                Managing Director & Founder
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-2">
                {db.getDirectorName()}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Need customized corporate hardware supply, high-density networks setup, or priority AMC contract quotes? Connect directly with our director for tailored enterprise consultation.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <a
              href={`https://wa.me/${db.getSupportPhone()}?text=Hello%20Mr.%20Irfan%20Uddin,%20I'm%20visiting%20your%20website%20and%20would%20like%20to%20inquire%20about%20your%20IT%20solutions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="w-4.5 h-4.5 fill-current" />
              <span>WhatsApp Director</span>
            </a>
            <a
              href={`tel:${db.getAlternatePhone()}`}
              className="px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Phone className="w-4.5 h-4.5" />
              <span>Call Alternate Line</span>
            </a>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Accordion Section */}
      <ScrollReveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-heading font-extrabold">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto">Common administrative and operational queries answered by our compliance team.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What is the SLA response time under Infotrack AMC Contracts?',
              a: 'We guarantee a 4-hour response time for critical network and server failures in Nalgonda, Hyderabad, and surrounding areas. For non-critical workstation issues, engineers respond within 8-12 hours.'
            },
            {
              q: 'Do you supply certified brands with local manufacturer warranties?',
              a: 'Yes, all enterprise hardware supplied—including Dell Laptops/Desktops, Cisco Switches, HP Printers, Hikvision Cameras, and Ubiquiti Gateways—comes with original tax invoices and full manufacturer warranties.'
            },
            {
              q: 'Can you customize custom rack server configurations?',
              a: 'Absolutely. We configure Dell PowerEdge and HPE ProLiant servers with dual Intel Xeon CPUs, custom ECC RAM capacity, SAS storage drive RAID configurations, and virtualized ESXi/Hyper-V hypervisors to suit database workloads.'
            },
            {
              q: 'Are onsite audits of legacy cables and security networks free?',
              a: 'We offer free initial design consultations for new offices. Detailed physical cable cataloging, mapping, and security vulnerability reports are charged under a nominal audit consultation fee, which is waived if you sign an AMC contract.'
            }
          ].map((faq, idx) => (
            <FAQItem key={idx} q={faq.q} a={faq.a} />
          ))}
        </div>
      </ScrollReveal>

      {/* Floating Scroll-to-top Widget */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 p-3.5 rounded-full bg-primary-600 hover:bg-primary-500 text-white shadow-xl hover:-translate-y-1 transition-all z-35 glow-primary"
          title="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Intro Video Fullscreen Playback Modal */}
      {showIntroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md transition-opacity duration-300">
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative max-w-5xl w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl flex flex-col group"
          >
            {/* The Video Element */}
            <div className="relative w-full h-full bg-white">
              {!videoLoadError ? (
                <video
                  ref={videoRef}
                  src={resolvedIntroVideoUrl}
                  poster={heroPreview}
                  className="w-full h-full object-cover bg-slate-950"
                  playsInline
                  autoPlay
                  muted={isMuted}
                  loop={false}
                  onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration || 0);
                    setCurrentTime(event.currentTarget.currentTime || 0);
                  }}
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => setVideoLoadError(true)}
                />
              ) : (
                <img
                  src={heroPreview}
                  alt="Infotrack enterprise cinematic preview"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-white/0 to-primary-500/10 pointer-events-none"></div>
              {videoLoadError && (
                <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-4 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-slate-200 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase text-primary-600 shadow-sm">
                    Video preview fallback
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[10px] sm:text-xs font-semibold shadow-sm">
                    Could not load the video source
                  </div>
                </div>
              )}
            </div>

            {/* Custom Control Bar */}
            <div 
              className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/95 via-white/75 to-transparent flex flex-col space-y-3 transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {/* Progress Slider */}
              <div className="flex items-center space-x-3 w-full">
                <span className="text-[10px] sm:text-xs text-slate-300 font-mono select-none">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/25 hover:bg-white/40 rounded-lg appearance-none cursor-pointer accent-primary-500 hover:h-1.5 transition-all outline-none"
                />
                <span className="text-[10px] sm:text-xs text-slate-300 font-mono select-none">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Lower Controls Row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  {/* Play / Pause */}
                  <button 
                    onClick={togglePlay}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-900 transition-colors"
                  >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current text-slate-900" /> : <Play className="w-5 h-5 fill-current text-slate-900" />}
                  </button>

                  {/* Skip Backward 10s */}
                  <button 
                    onClick={skipBackward}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
                    title="Rewind 10s"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-[10px] font-bold">10s</span>
                  </button>

                  {/* Skip Forward 10s */}
                  <button 
                    onClick={skipForward}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1"
                    title="Forward 10s"
                  >
                    <span className="text-[10px] font-bold">10s</span>
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Right control group */}
                <div className="flex items-center space-x-4">
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={toggleMute}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 h-1 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary-500 outline-none transition-all"
                    />
                  </div>

                  {/* Fullscreen Toggle */}
                  <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Top Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 hover:border-slate-300 transition-all z-30 shadow"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showBrochureLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4 py-6"
          onClick={closeBrochureLightbox}
        >
          <div
            className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeBrochureLightbox}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/95 p-2 text-slate-900 shadow-lg transition hover:bg-white"
              aria-label="Close brochure image"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="bg-slate-950">
              <img
                src={heroPreview}
                alt="Infotrack enterprise brochure full view"
                className="max-h-[92vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

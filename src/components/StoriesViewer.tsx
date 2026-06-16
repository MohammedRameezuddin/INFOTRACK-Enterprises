import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Pause, Play, ExternalLink, Eye, Clock } from 'lucide-react';
import type { Story } from '../db/mockDb';

/** Validate URLs: only allow safe protocols (http, https, or relative paths) */
function isSafeUrl(url: string): boolean {
  if (!url) return false;
  // Allow relative paths
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface StoriesViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onView: (view: string) => void;
}

const AUTO_ADVANCE_MS = 6000; // 6 seconds per story

export const StoriesViewer: React.FC<StoriesViewerProps> = ({ stories, initialIndex, onClose, onView }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isMuted = true; // Stories are always muted (no sound toggle needed)
  const [imageLoaded, setImageLoaded] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [showControls, setShowControls] = useState(true);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const story = stories[currentIndex];

  // Reset state when story changes
  useEffect(() => {
    setProgress(0);
    progressRef.current = 0;
    startTimeRef.current = Date.now();
    setImageLoaded(false);
    setIsPaused(false);
  }, [currentIndex]);

  // Auto-advance timer using requestAnimationFrame
  const tick = useCallback(() => {
    if (isPaused || !story) {
      animationRef.current = requestAnimationFrame(tick);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const pct = Math.min(elapsed / AUTO_ADVANCE_MS, 1);
    progressRef.current = pct;
    setProgress(pct);

    if (pct >= 1) {
      // Auto-advance to next story
      if (currentIndex < stories.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    } else {
      animationRef.current = requestAnimationFrame(tick);
    }
  }, [isPaused, currentIndex, stories.length, onClose, story]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [tick]);

  // Pause when holding down
  const handlePointerDown = () => {
    setIsPaused(true);
    startTimeRef.current = Date.now() - progressRef.current * AUTO_ADVANCE_MS;
  };

  const handlePointerUp = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - progressRef.current * AUTO_ADVANCE_MS;
  };

  // Tap navigation: left = prev, right = next
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;

    if (pct < 0.3) {
      goToPrev();
    } else if (pct > 0.7) {
      goToNext();
    }

    // Show controls briefly
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 2000);
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    const dt = Date.now() - touchStart.time;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && dt < 300) {
      if (dx < 0) goToNext();
      else goToPrev();
    } else if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
      onClose(); // Swipe down to close
    }

    setTouchStart(null);
  };

  // Store latest callbacks in ref to avoid stale closures in event listener
  const goToNextRef = useRef(goToNext);
  const goToPrevRef = useRef(goToPrev);
  const onCloseRef = useRef(onClose);
  goToNextRef.current = goToNext;
  goToPrevRef.current = goToPrev;
  onCloseRef.current = onClose;

  // Keyboard navigation (stable listener, runs once)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': goToNextRef.current(); break;
        case 'ArrowLeft': goToPrevRef.current(); break;
        case 'Escape': onCloseRef.current(); break;
        case ' ':
          e.preventDefault();
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleCtaClick = () => {
    if (story?.ctaUrl && isSafeUrl(story.ctaUrl)) {
      onClose();
      // Navigate based on URL
      if (story.ctaUrl.startsWith('/')) {
        const viewMap: Record<string, string> = {
          '/store': 'store',
          '/services': 'services',
          '/portal': 'portal',
        };
        onView(viewMap[story.ctaUrl] || 'home');
      } else {
        window.open(story.ctaUrl, '_blank', 'noopener,noreferrer');
      }
    } else if (story?.ctaUrl) {
      // Unsafe URL — just close the viewer
      onClose();
    }
  };

  const getTimeLeft = (expiresAt: string | null): string => {
    if (!expiresAt) return 'Permanent';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m left`;
    if (hours < 24) return `${hours}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const getCreatedAgo = (createdAt: string): string => {
    const diff = Date.now() - new Date(createdAt).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Story Container - Mobile-first 9:16 aspect ratio */}
      <div
        className="relative w-full max-w-[420px] h-full max-h-[90vh] bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden shadow-2xl"
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 flex gap-1 p-2 pt-3">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress * 100}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header: Avatar + Title + Close */}
        <div className={`absolute top-7 left-0 right-0 z-30 flex items-center justify-between px-3 py-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2.5">
            {/* Mini avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/60 shadow-sm">
              <img
                src={story.thumbnailUrl || story.mediaUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight drop-shadow-md">
                Infotrack Enterprises
              </p>
              <p className="text-white/60 text-[10px] flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {getCreatedAgo(story.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setIsPaused(p => !p); }}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-white" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="absolute inset-0 z-10">
          {story.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={story.mediaUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              autoPlay
              playsInline
              onLoadedData={() => setImageLoaded(true)}
            />
          ) : (
            <img
              src={story.mediaUrl}
              alt={story.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          )}

          {/* Loading spinner */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Gradient Overlays for text readability */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Bottom Content: Title, Description, CTA */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-6 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Category badge */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
              {story.category}
            </span>
            <span className="text-white/50 text-[10px] flex items-center gap-1">
              <Eye className="w-2.5 h-2.5" />
              {story.viewCount.toLocaleString()} views
            </span>
            <span className="text-white/50 text-[10px]">
              {getTimeLeft(story.expiresAt)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-white font-heading font-bold text-xl sm:text-2xl leading-tight drop-shadow-lg">
            {story.title}
          </h2>

          {/* Description */}
          {story.description && (
            <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
              {story.description}
            </p>
          )}

          {/* CTA Button */}
          {story.ctaText && (
            <button
              onClick={handleCtaClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-electric text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {story.ctaText}
              {story.ctaUrl && <ExternalLink className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation Arrows (desktop only) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentIndex < stories.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 z-[25] flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-pulse">
              <Pause className="w-7 h-7 text-white" />
            </div>
          </div>
        )}

        {/* Story counter */}
        <div className="absolute bottom-2 right-3 z-30 text-white/40 text-[10px] font-medium">
          {currentIndex + 1} / {stories.length}
        </div>
      </div>
    </div>
  );
};

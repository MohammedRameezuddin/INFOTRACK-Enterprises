import React, { useState, useEffect, useRef } from 'react';
import { Eye, Clock, Zap, ShoppingBag, Megaphone, Newspaper, Gift } from 'lucide-react';
import { db } from '../db/mockDb';
import type { Story } from '../db/mockDb';

interface StoriesBarProps {
  onOpenStory: (storyIndex: number) => void;
  onView: (view: string) => void;
}

const CATEGORY_ICON: Record<Story['category'], React.FC<{ className?: string }>> = {
  offer: Zap,
  product: ShoppingBag,
  announcement: Megaphone,
  news: Newspaper,
  promotion: Gift,
};

const CATEGORY_COLOR: Record<Story['category'], string> = {
  offer: 'from-pink-500 via-rose-500 to-red-500',
  product: 'from-primary-500 via-blue-500 to-electric',
  announcement: 'from-amber-400 via-orange-500 to-red-400',
  news: 'from-emerald-400 via-green-500 to-teal-500',
  promotion: 'from-violet-500 via-purple-500 to-fuchsia-500',
};

export const StoriesBar: React.FC<StoriesBarProps> = ({ onOpenStory, onView }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Run expiration cleanup then load active stories
    db.expireOldStories();
    const active = db.getActiveStories();
    setStories(active);

    // Load previously viewed IDs from sessionStorage
    const viewedRaw = sessionStorage.getItem('infotrack_viewed_stories');
    if (viewedRaw) {
      try { setViewed(new Set(JSON.parse(viewedRaw))); } catch { /* ignore */ }
    }
  }, []);

  // Periodically refresh to auto-expire
  useEffect(() => {
    const interval = setInterval(() => {
      db.expireOldStories();
      setStories(db.getActiveStories());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenStory = (index: number) => {
    const story = stories[index];
    if (story) {
      const newViewed = new Set(viewed);
      newViewed.add(story.id);
      setViewed(newViewed);
      sessionStorage.setItem('infotrack_viewed_stories', JSON.stringify([...newViewed]));
      db.incrementStoryView(story.id);
      onOpenStory(index);
    }
  };

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -120 : 120;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
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

  if (stories.length === 0) return null;

  return (
    <section className="w-full bg-white border-b border-slate-100 py-4 relative">
      {/* Section Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-electric flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900 tracking-tight">
            Today's Updates
          </h3>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-bold uppercase tracking-wider">
            {stories.length} {stories.length === 1 ? 'Story' : 'Stories'}
          </span>
        </div>
        <button
          onClick={() => onView('stories-admin')}
          className="text-[11px] font-bold text-primary-500 hover:text-primary-700 transition-colors uppercase tracking-wider"
        >
          Manage Stories
        </button>
      </div>

      {/* Scrollable Story Circles */}
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Scroll left"
        >
          ←
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {stories.map((story, index) => {
            const CatIcon = CATEGORY_ICON[story.category] || Zap;
            const gradientClass = CATEGORY_COLOR[story.category] || CATEGORY_COLOR.offer;
            const isViewed = viewed.has(story.id);

            return (
              <button
                key={story.id}
                onClick={() => handleOpenStory(index)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
              >
                {/* Circle with gradient ring */}
                <div className="relative">
                  {/* Gradient ring (unviewed = vibrant, viewed = grey) */}
                  <div
                    className={`w-[68px] h-[68px] sm:w-[74px] sm:h-[74px] rounded-full p-[3px] ${
                      isViewed
                        ? 'bg-slate-200'
                        : `bg-gradient-to-br ${gradientClass}`
                    } transition-all group-hover:scale-105`}
                  >
                    {/* White inner ring */}
                    <div className="w-full h-full rounded-full bg-white p-[2px]">
                      {/* Thumbnail */}
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                        <img
                          src={story.thumbnailUrl || story.mediaUrl}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category icon badge */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center border-2 border-white shadow-sm`}
                  >
                    <CatIcon className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Unviewed pulse dot */}
                  {!isViewed && (
                    <div className="absolute top-0 right-0 w-3 h-3">
                      <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-50" />
                      <div className="absolute inset-0 rounded-full bg-blue-500 border border-white" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold text-center leading-tight w-[68px] sm:w-[74px] truncate ${
                    isViewed ? 'text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {story.title.length > 18 ? story.title.slice(0, 18) + '…' : story.title}
                </span>

                {/* Time left */}
                <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                  <Clock className="w-2.5 h-2.5" />
                  {getTimeLeft(story.expiresAt)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all opacity-0 hover:opacity-100 focus:opacity-100"
          aria-label="Scroll right"
        >
          →
        </button>
      </div>
    </section>
  );
};

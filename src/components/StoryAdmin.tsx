import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Plus, Trash2, Edit3, Save, X, Eye, Clock,
  Image as ImageIcon, Video, Upload, TrendingUp, BarChart3,
  CheckCircle2, AlertCircle, Zap, ShoppingBag, Megaphone,
  Newspaper, Gift, Camera, FileVideo, FolderOpen, Send
} from 'lucide-react';
import { db } from '../db/mockDb';
import type { Story } from '../db/mockDb';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Validate URLs: only allow http, https, or safe relative paths */
function isSafeMediaUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (url.startsWith('data:')) return true; // data URIs from file upload are OK
  try {
    const parsed = new URL(url);
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Validate CTA URLs: only allow http, https, or safe relative paths (no data: or javascript:) */
function isSafeCtaUrl(url: string): boolean {
  if (!url) return true; // empty is OK
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

interface StoryAdminProps {
  setView: (view: string) => void;
}

const CATEGORIES: { value: Story['category']; label: string; icon: React.FC<{ className?: string }> }[] = [
  { value: 'offer', label: 'Offer', icon: Zap },
  { value: 'product', label: 'Product', icon: ShoppingBag },
  { value: 'announcement', label: 'Announcement', icon: Megaphone },
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'promotion', label: 'Promotion', icon: Gift },
];

const EXPIRY_OPTIONS = [
  { label: '24 Hours', value: 24 },
  { label: '3 Days', value: 72 },
  { label: '7 Days', value: 168 },
  { label: 'Permanent', value: 0 },
];

const CTA_OPTIONS = [
  'Shop Now', 'View Offer', 'Contact Us', 'Learn More',
  'Book Now', 'Register Now', 'View Product', 'Get Quote'
];

type Tab = 'manage' | 'create' | 'analytics';

export const StoryAdmin: React.FC<StoryAdminProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<Tab>('manage');
  const [stories, setStories] = useState<Story[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [category, setCategory] = useState<Story['category']>('offer');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaUrl, setCtaUrl] = useState('/store');
  const [expiryHours, setExpiryHours] = useState(24);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    setStories(db.getStories());
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setMediaType('image');
    setCategory('offer');
    setCtaText('Shop Now');
    setCtaUrl('/store');
    setExpiryHours(24);
    setStatus('published');
    setMediaFile(null);
    setMediaPreview('');
    setEditingId(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      e.target.value = ''; // Reset input
      return;
    }

    setMediaFile(file);

    // Create local preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setMediaPreview(dataUrl);
      setMediaUrl(dataUrl); // Store as data URL for demo
      if (file.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (asDraft = false) => {
    if (!title.trim()) return;

    // Validate CTA URL
    if (ctaUrl && !isSafeCtaUrl(ctaUrl)) {
      alert('Invalid CTA link. Only http, https, or relative paths (e.g. /store) are allowed.');
      return;
    }

    // Validate media URL
    const rawUrl = mediaUrl || 'https://images.unsplash.com/photo-1607053300615-3c92e2e1d1b4?w=1080&auto=format&fit=crop';
    if (!isSafeMediaUrl(rawUrl)) {
      alert('Invalid media URL. Only http, https, or uploaded files are allowed.');
      return;
    }

    const finalUrl = rawUrl;
    const thumbUrl = finalUrl.replace('w=1080', 'w=150');

    const expiresAt = expiryHours === 0 ? null : new Date(Date.now() + expiryHours * 3600000).toISOString();

    if (editingId) {
      db.updateStory(editingId, {
        title: title.trim(),
        description: description.trim(),
        mediaUrl: finalUrl,
        thumbnailUrl: thumbUrl,
        mediaType,
        category,
        ctaText,
        ctaUrl,
        expiresAt,
        status: asDraft ? 'draft' : 'published'
      });
    } else {
      db.createStory({
        title: title.trim(),
        description: description.trim(),
        mediaUrl: finalUrl,
        thumbnailUrl: thumbUrl,
        mediaType,
        status: asDraft ? 'draft' : 'published',
        createdBy: 'user-admin',
        expiresAt,
        ctaText,
        ctaUrl,
        category
      });
    }

    resetForm();
    loadStories();
    setActiveTab('manage');
  };

  const handleEdit = (story: Story) => {
    setTitle(story.title);
    setDescription(story.description);
    setMediaUrl(story.mediaUrl);
    setMediaPreview(story.mediaUrl);
    setMediaType(story.mediaType);
    setCategory(story.category);
    setCtaText(story.ctaText);
    setCtaUrl(story.ctaUrl);
    setStatus(story.status as 'draft' | 'published');
    setEditingId(story.id);
    setExpiryHours(24);
    setActiveTab('create');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this story? This cannot be undone.')) {
      db.deleteStory(id);
      loadStories();
    }
  };

  const handleToggleStatus = (story: Story) => {
    const newStatus = story.status === 'published' ? 'draft' : 'published';
    db.updateStory(story.id, { status: newStatus });
    loadStories();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const activeStories = stories.filter(s => s.status === 'published' && (!s.expiresAt || new Date(s.expiresAt) > new Date()));
  const totalViews = stories.reduce((sum, s) => sum + s.viewCount, 0);
  const avgViews = stories.length > 0 ? Math.round(totalViews / stories.length) : 0;

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('home')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">Story Manager</h1>
            <p className="text-sm text-slate-500">Create, manage and track website stories</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setActiveTab('create'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-electric text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          New Story
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {([['manage', 'Manage Stories'], ['create', editingId ? 'Edit Story' : 'Create Story'], ['analytics', 'Analytics']] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* MANAGE TAB */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          {stories.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No stories yet</p>
              <p className="text-sm">Create your first story to get started</p>
            </div>
          ) : (
            stories.map(story => {
              const isExpired = story.expiresAt && new Date(story.expiresAt) < new Date();
              const isActive = story.status === 'published' && !isExpired;

              return (
                <div key={story.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-primary-200 transition-all">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-28 h-28 sm:h-auto flex-shrink-0 bg-slate-100 relative overflow-hidden">
                    <img src={story.thumbnailUrl || story.mediaUrl} alt={story.title} className="w-full h-full object-cover" />
                    {/* Status badge */}
                    <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isExpired ? 'bg-red-500 text-white' :
                      story.status === 'draft' ? 'bg-amber-500 text-white' :
                      'bg-emerald-500 text-white'
                    }`}>
                      {isExpired ? 'Expired' : story.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{story.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{story.description}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase flex-shrink-0">
                        {story.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{story.viewCount.toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(story.createdAt)}</span>
                      {story.expiresAt && (
                        <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
                          <AlertCircle className="w-3 h-3" />
                          Expires {formatDate(story.expiresAt)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleEdit(story)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(story)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {isActive ? <><X className="w-3.5 h-3.5" />Unpublish</> : <><Send className="w-3.5 h-3.5" />Publish</>}
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CREATE / EDIT TAB */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="font-heading font-bold text-lg text-slate-900">
              {editingId ? 'Edit Story' : 'Create New Story'}
            </h2>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Summer Sale is Live!"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Short description for the story..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        category === cat.value
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expiry */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Story Duration</label>
              <div className="flex flex-wrap gap-2">
                {EXPIRY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setExpiryHours(opt.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      expiryHours === opt.value
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">CTA Button</label>
                <select
                  value={ctaText}
                  onChange={e => setCtaText(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-400 transition-all"
                >
                  {CTA_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">CTA Link</label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={e => setCtaUrl(e.target.value)}
                  placeholder="/store"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    ctaUrl && !isSafeCtaUrl(ctaUrl)
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-slate-200 focus:border-primary-400'
                  }`}
                />
                {ctaUrl && !isSafeCtaUrl(ctaUrl) && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Only http/https or /relative paths
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleSubmit(false)}
                disabled={!title.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-electric text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update & Publish' : 'Publish Now'}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={!title.trim()}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Save Draft
              </button>
              {editingId && (
                <button
                  onClick={() => { resetForm(); setActiveTab('manage'); }}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Media Upload & Preview */}
          <div className="space-y-4">
            {/* Upload area */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-500" />
                Upload Media
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-slate-500 hover:text-primary-500"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-slate-500 hover:text-primary-500"
                >
                  <FileVideo className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Video</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50 transition-all text-slate-500 hover:text-primary-500"
                >
                  <FolderOpen className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">Gallery</span>
                </button>
              </div>

              {/* Or paste URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Or paste media URL</label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={e => { setMediaUrl(e.target.value); setMediaPreview(e.target.value); }}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-3 py-2 rounded-xl border text-sm transition-all ${
                    mediaUrl && !mediaUrl.startsWith('data:') && !isSafeMediaUrl(mediaUrl)
                      ? 'border-red-300 focus:border-red-400 bg-red-50'
                      : 'border-slate-200 focus:border-primary-400'
                  }`}
                />
                {mediaUrl && !mediaUrl.startsWith('data:') && !isSafeMediaUrl(mediaUrl) && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Only http/https URLs are allowed
                  </p>
                )}
              </div>

              {mediaFile && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-medium">{mediaFile.name} ({(mediaFile.size / 1024).toFixed(0)} KB)</span>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-[9/16] max-h-[400px] relative">
              {mediaPreview ? (
                mediaType === 'video' ? (
                  <video src={mediaPreview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <p className="text-xs font-medium">Story Preview</p>
                </div>
              )}

              {/* Preview overlay */}
              {title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[9px] font-bold uppercase">
                      {category}
                    </span>
                    <h4 className="text-white font-heading font-bold text-lg leading-tight">{title}</h4>
                    {description && <p className="text-white/70 text-xs line-clamp-2">{description}</p>}
                    {ctaText && (
                      <div className="py-2 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-electric text-white text-xs font-bold text-center w-fit">
                        {ctaText}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Stories', value: stories.length, icon: ImageIcon, color: 'text-primary-500' },
              { label: 'Active Stories', value: activeStories.length, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-violet-500' },
              { label: 'Avg Views', value: avgViews.toLocaleString(), icon: TrendingUp, color: 'text-amber-500' },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${card.color}`} />
                    <BarChart3 className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                  <p className="text-2xl font-heading font-bold text-slate-900">{card.value}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{card.label}</p>
                </div>
              );
            })}
          </div>

          {/* Per-story analytics */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-heading font-bold text-sm text-slate-900">Story Performance</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {stories.map(story => {
                const maxViews = Math.max(...stories.map(s => s.viewCount), 1);
                const barWidth = (story.viewCount / maxViews) * 100;

                return (
                  <div key={story.id} className="px-5 py-3 flex items-center gap-4">
                    <img src={story.thumbnailUrl || story.mediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{story.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>{story.category}</span>
                        <span>{story.viewCount.toLocaleString()} views</span>
                      </div>
                    </div>
                    {/* Bar chart */}
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-electric rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-10 text-right flex-shrink-0">
                      {story.viewCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, Plus } from 'lucide-react';
import { aiEngine } from '../services/aiEngine';
import type { Product } from '../db/mockDb';

interface AIChatbotProps {
  onAddToCart: (product: Product) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: Product[]; // Attached recommendations
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Hello! I am your Infotrack AI Commerce Assistant, powered by our FastAPI Engine. 🤖\n\nI can perform **semantic search** across our inventory (e.g. *"find a portable programming laptop"*), recommend items inside a budget, or help you book services.\n\nWhat are you looking for today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion chips
  const suggestions = [
    'Laptop for coding',
    'Outdoor 4K CCTV camera',
    'Best high-availability server',
    'How do I request an AMC contract?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Network Latency to FastAPI AI Backend (e.g., 800ms)
    setTimeout(() => {
      // Analyze text using local AI Engine
      const responseText = aiEngine.handleChatSession(
        [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      );

      // Extract products mentioned in the query
      const recResult = aiEngine.getRecommendationForPrompt(text);
      const matchedProducts = recResult.matchedProducts.map(r => r.product);

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: responseText,
        products: matchedProducts.length > 0 ? matchedProducts : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[420px] h-[550px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-electric p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center glow-primary">
                <Sparkles className="w-5 h-5 text-primary-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-sm leading-tight text-white flex items-center space-x-1.5">
                  <span>FastAPI Intelligence Layer</span>
                  <span className="text-[9px] bg-primary-500 text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
                </h4>
                <p className="text-[10px] text-primary-200">Linked to PostgreSQL + pgvector</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white scrollbar-thin">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.role === 'user'
                      ? 'bg-primary-950 border-primary-500/20 text-primary-400'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2 max-w-[80%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed border ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white border-primary-500'
                          : 'bg-slate-50 text-slate-900 border-slate-200'
                      }`}
                    >
                    {/* Format markdown-like newlines & bold text */}
                    {msg.content.split('\n').map((line, idx) => {
                      // Process bold matches **text**
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={idx} className={`${line.trim() === '' ? 'h-2' : 'mb-1'}`}>
                          {parts.map((part, pIdx) =>
                                pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold">{part}</strong> : part
                              )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Recommendations attachment */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {msg.products.map(prod => (
                        <div
                          key={prod.id}
                          className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors hover:border-primary-500/30"
                        >
                          <div className="flex items-center space-x-2">
                            <img
                              src={prod.images[0]}
                              alt={prod.title}
                              className="w-10 h-10 rounded object-cover border border-slate-200"
                            />
                            <div className="text-left">
                              <p className="font-semibold text-slate-900 truncate w-36 sm:w-44">{prod.title}</p>
                              <p className="text-slate-500 font-medium mt-0.5">Request on WhatsApp</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onAddToCart(prod)}
                            className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-lg flex items-center justify-center transition-colors group"
                            title="Add to Cart"
                          >
                            <Plus className="w-3.5 h-3.5 group-hover:scale-110" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-500 flex items-center space-x-1 shrink-0">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips selector */}
          <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none">
            {suggestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-full transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask for custom recommendations..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-primary-900/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Sparkles Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-primary-600 to-electric text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 group glow-primary border border-primary-400/20"
        title="Open AI Assistant"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-spin" />
        )}
      </button>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Send, X, MessageSquare, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../lib/currency';

export default function FastAIAssistant() {
  const { currency } = useCurrency();
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm your Fast AI Assistant. How can I help you manage your business finances today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('Thinking...');
  
  const getSuggestions = () => {
    const path = window.location.pathname;
    if (path.includes('revenue')) {
      return ["Top income sources?", "How to boost revenue?", "Revenue trends?"];
    }
    if (path.includes('expenses')) {
      return ["Highest expense category?", "Tax deductible tips?", "Reduce costs?"];
    }
    if (path.includes('affiliate')) {
      return ["Best affiliate program?", "Increase conversions?", "New program ideas?"];
    }
    if (path.includes('products')) {
      return ["Best selling product?", "Pricing strategy?", "Product ideas?"];
    }
    return ["Profit this month?", "Top expenses?", "Growth tips?"];
  };

  const suggestions = getSuggestions();

  useEffect(() => {
    if (isLoading) {
      const messages = ['Analyzing data...', 'Consulting Gemini...', 'Calculating...', 'Almost there...'];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setThinkingMessage(messages[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    if (!overrideInput) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // @ts-ignore
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite-latest',
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }]
          }
        ],
        config: {
          systemInstruction: `You are a helpful financial assistant for digital entrepreneurs. Keep your responses concise, professional, and actionable. 
          The user is currently on the "${window.location.pathname}" page. 
          The user's preferred currency is ${currency.name} (${currency.code}). Please use the ${currency.symbol} symbol for all monetary values in your responses.
          You have access to the user's financial dashboard context (revenue, expenses, affiliate programs).`,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });

      let fullText = '';
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);
      
      for await (const chunk of response) {
        fullText += chunk.text || '';
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'ai', content: fullText };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-80 md:w-96 overflow-hidden flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold">Fast AI Assistant</h3>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Powered by Gemini 2.5 Lite</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">How can I help you with your business today?</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-xs text-slate-500 italic">{thinkingMessage}</span>
                      </div>
                    </div>
                  )}
                  {messages.length === 1 && !isLoading && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(undefined, suggestion)}
                          className="text-[10px] font-bold px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-colors group relative"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full bg-blue-600/20"
          />
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform relative z-10" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-20"></span>
        </motion.button>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Loader2, ChevronRight, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIInsightsProps {
  data: {
    summary: {
      revenue: number;
      expenses: number;
      netProfit: number;
      affiliateEarnings: number;
    };
    transactions: any[];
    affiliatePrograms: any[];
    digitalProducts: any[];
  };
}

export default function AIInsights({ data }: AIInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      // @ts-ignore - Vite handles process.env replacement
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        As a financial expert for digital entrepreneurs, analyze the following financial data for "SmartMaker Hub" and provide 3-4 concise, actionable insights.
        Focus on:
        1. Revenue trends and growth opportunities.
        2. Expense optimization.
        3. Affiliate performance.
        4. A "Pro Tip" for scaling.

        Data:
        - Total Revenue: $${data.summary.revenue}
        - Total Expenses: $${data.summary.expenses}
        - Net Profit: $${data.summary.netProfit}
        - Affiliate Earnings: $${data.summary.affiliateEarnings}
        - Top Affiliate Programs: ${data.affiliatePrograms.slice(0, 3).map(p => `${p.name} ($${p.commissions})`).join(', ')}
        - Top Products: ${data.digitalProducts.slice(0, 3).map(p => `${p.name} (${p.sales} sales)`).join(', ')}
        - Recent Transactions: ${data.transactions.slice(0, 5).map(t => `${t.date}: ${t.description} ($${t.amount})`).join(', ')}

        Format the response as a JSON array of objects with "type" (one of: 'growth', 'warning', 'tip'), "title", and "description".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const result = JSON.parse(response.text || '[]');
      setInsights(result);
    } catch (err: any) {
      console.error("Failed to generate insights:", err);
      setError(err.message || "Failed to generate AI insights.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Financial Insights</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Powered by Gemini</p>
          </div>
        </div>
        {!insights && !isGenerating && (
          <button 
            onClick={generateInsights}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Generate
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 space-y-3"
            >
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-500 animate-pulse">Analyzing your financial data...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
              <button onClick={generateInsights} className="ml-auto text-xs font-bold underline">Retry</button>
            </motion.div>
          ) : insights ? (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {(insights as any).map((insight: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    insight.type === 'growth' ? 'bg-emerald-100 text-emerald-600' :
                    insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {insight.type === 'growth' ? <TrendingUp className="w-5 h-5" /> :
                     insight.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                     <Lightbulb className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={generateInsights}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Refresh Insights
              </button>
            </motion.div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-4">Get personalized AI insights based on your revenue and expenses.</p>
              <button 
                onClick={generateInsights}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Analyze My Data
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

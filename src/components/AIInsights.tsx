import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Sparkles, Loader2, ChevronRight, TrendingUp, AlertCircle, Lightbulb, Target, Activity, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../lib/currency';
import { parseAIJson } from '../lib/utils';

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
  const { currency, formatCurrency } = useCurrency();
  const [insightsData, setInsightsData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        As an elite financial advisor and growth strategist for digital creators and entrepreneurs, perform a deep-dive analysis on the following financial data.
        
        Your goal is to provide advanced, highly personalized insights that go beyond basic reporting. Identify hidden trends, evaluate creator performance, and offer strategic recommendations for scaling their business.

        Focus your analysis on:
        1. Creator Performance & Monetization: How effectively are they monetizing their audience through products vs. affiliates?
        2. Trend Identification: Spot patterns in revenue or expenses that might not be immediately obvious.
        3. Growth Recommendations: Provide specific, actionable steps to scale revenue or optimize profit margins.
        4. Risk Assessment: Identify any over-reliance on a single income stream or concerning expense trends.

        All amounts are in ${currency.name} (${currency.code}). Please use the ${currency.symbol} symbol in your response.

        Data:
        - Total Revenue: ${formatCurrency(data.summary.revenue)}
        - Total Expenses: ${formatCurrency(data.summary.expenses)}
        - Net Profit: ${formatCurrency(data.summary.netProfit)}
        - Affiliate Earnings: ${formatCurrency(data.summary.affiliateEarnings)}
        - Top Affiliate Programs: ${data.affiliatePrograms.slice(0, 3).map(p => `${p.name} (${formatCurrency(p.commissions)})`).join(', ')}
        - Top Products: ${data.digitalProducts.slice(0, 3).map(p => `${p.name} (${p.sales} sales)`).join(', ')}
        - Recent Transactions: ${data.transactions.slice(0, 10).map(t => `${t.date}: ${t.type} - ${t.category} - ${t.description} (${formatCurrency(t.amount)})`).join(', ')}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              creatorScore: {
                type: Type.INTEGER,
                description: "A score from 0 to 100 representing overall financial health and growth potential."
              },
              summary: {
                type: Type.STRING,
                description: "A brief 1-2 sentence executive summary of their current standing."
              },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description: "One of: 'Performance', 'Trend', 'Growth', 'Risk'"
                    },
                    title: {
                      type: Type.STRING
                    },
                    description: {
                      type: Type.STRING
                    },
                    actionItem: {
                      type: Type.STRING,
                      description: "A specific next step for the creator."
                    },
                    impact: {
                      type: Type.STRING,
                      description: "One of: 'High', 'Medium', 'Low'"
                    }
                  },
                  required: ["category", "title", "description", "actionItem", "impact"]
                }
              }
            },
            required: ["creatorScore", "summary", "insights"]
          }
        }
      });

      const result = parseAIJson(response.text);
      setInsightsData(result);
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
        {!insightsData && !isGenerating && (
          <button 
            onClick={generateInsights}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            Generate Advanced Analytics
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
              className="flex flex-col items-center justify-center py-12 space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin relative z-10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">Running Advanced Analytics Engine...</p>
                <p className="text-xs text-slate-500 mt-1">Analyzing performance, identifying trends, and generating growth recommendations.</p>
              </div>
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
          ) : insightsData ? (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 border-blue-100 bg-white shadow-sm flex-shrink-0 relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#eff6ff" strokeWidth="8" />
                    <motion.circle 
                      cx="50" cy="50" r="46" fill="none" stroke="#3b82f6" strokeWidth="8" 
                      strokeDasharray="289" 
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * insightsData.creatorScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-2xl font-black text-slate-900 relative z-10">{insightsData.creatorScore}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 relative z-10">Score</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Executive Summary
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{insightsData.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insightsData.insights?.map((insight: any, idx: number) => (
                  <div key={idx} className="flex flex-col p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.category === 'Growth' ? 'bg-emerald-100 text-emerald-600' :
                        insight.category === 'Risk' ? 'bg-red-100 text-red-600' :
                        insight.category === 'Performance' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {insight.category === 'Growth' ? <TrendingUp className="w-4 h-4" /> :
                         insight.category === 'Risk' ? <AlertCircle className="w-4 h-4" /> :
                         insight.category === 'Performance' ? <Target className="w-4 h-4" /> :
                         <Lightbulb className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          insight.category === 'Growth' ? 'text-emerald-600' :
                          insight.category === 'Risk' ? 'text-red-600' :
                          insight.category === 'Performance' ? 'text-blue-600' :
                          'text-purple-600'
                        }`}>{insight.category}</span>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{insight.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">{insight.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block mb-0.5">Recommended Action</span>
                          <span className="text-xs text-slate-600">{insight.actionItem}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          insight.impact === 'High' ? 'bg-emerald-100 text-emerald-700' :
                          insight.impact === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={generateInsights}
                className="w-full py-3 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Run Analysis Again
              </button>
            </motion.div>
          ) : (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Advanced Creator Analytics</h4>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Leverage our advanced AI engine to deeply analyze your performance, identify hidden trends, and receive highly personalized, actionable growth strategies.
              </p>
              <button 
                onClick={generateInsights}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                Run Advanced Analysis
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

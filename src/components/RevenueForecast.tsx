import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Loader2, TrendingUp, BarChart3, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface RevenueForecastProps {
  transactions: any[];
}

export default function RevenueForecast({ transactions }: RevenueForecastProps) {
  const [forecast, setForecast] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateForecast = async () => {
    setIsGenerating(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const revenueData = transactions
        .filter(t => t.type === 'income')
        .map(t => ({ date: t.date, amount: t.amount, category: t.category }));

      const prompt = `
        Analyze these income transactions and predict revenue for the next 3 months.
        Provide a JSON object with:
        - "prediction": a short text summary
        - "monthlyForecast": an array of 3 objects with "month" and "estimatedAmount"
        - "confidence": a percentage (0-100)
        - "keyDrivers": array of 2-3 strings

        Data: ${JSON.stringify(revenueData.slice(-20))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      setForecast(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <BarChart3 className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-200" />
          <h3 className="font-bold text-lg">AI Revenue Forecast</h3>
        </div>

        {isGenerating ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
            <p className="text-blue-100 text-sm font-medium">Calculating future projections...</p>
          </div>
        ) : forecast ? (
          <div className="space-y-4">
            <p className="text-sm text-blue-50/90 leading-relaxed">{forecast.prediction}</p>
            
            <div className="grid grid-cols-3 gap-3">
              {forecast.monthlyForecast?.map((m: any, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-blue-200 tracking-wider mb-1">{m.month}</p>
                  <p className="text-lg font-bold">${m.estimatedAmount.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">{forecast.confidence}% Confidence</span>
              </div>
              <button 
                onClick={generateForecast}
                className="text-xs font-bold text-blue-200 hover:text-white transition-colors ml-auto"
              >
                Recalculate
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-blue-100 mb-4">Predict your next 3 months of revenue based on historical trends.</p>
            <button 
              onClick={generateForecast}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Forecast
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, CheckCircle2, ArrowUpRight, Trophy, Flag, Settings2, Sliders, Share2, Sparkles } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../lib/currency';

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ 
          top: "100%", 
          left: `${Math.random() * 100}%`,
          scale: Math.random() * 0.5 + 0.5,
          rotate: 0,
          opacity: 1
        }}
        animate={{ 
          top: "-10%",
          left: `${Math.random() * 100 + (Math.random() * 20 - 10)}%`,
          rotate: 720,
          opacity: [1, 1, 0]
        }}
        transition={{ 
          duration: Math.random() * 3 + 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: Math.random() * 5
        }}
        className={`absolute w-2 h-2 rounded-sm ${
          ['bg-emerald-400', 'bg-yellow-400', 'bg-blue-400', 'bg-pink-400', 'bg-purple-400', 'bg-orange-400'][i % 6]
        }`}
      />
    ))}
  </div>
);

const CircularProgress = ({ progress, color, size = 64, strokeWidth = 6 }: { progress: number, color: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-900">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default function Goals() {
  const { currency, formatCurrency } = useCurrency();
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showForecastSettings, setShowForecastSettings] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    target_amount: '',
    month: new Date().toISOString().substring(0, 10)
  });

  // Forecasting Settings
  const [forecastSettings, setForecastSettings] = useState({
    method: 'linear', // 'linear', 'moving_average', 'conservative'
    lookbackMonths: 3,
    growthMultiplier: 1.0
  });

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setGoals(data.goals || []);
        setTransactions(data.transactions || []);
      })
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          target_amount: parseFloat(formData.target_amount) || 0,
          month: formData.month
        })
      });
      
      setIsAdding(false);
      setFormData({ ...formData, target_amount: '' });
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setGoals(data.goals || []);
          setTransactions(data.transactions || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to add goal:", err);
      alert("Failed to add goal. Please try again.");
    }
  };

  const incomeByMonth = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedMonths = Object.keys(incomeByMonth).sort();
  const hasEnoughData = sortedMonths.length >= forecastSettings.lookbackMonths;

  let forecastAmount = 0;
  let forecastGrowth = 0;

  if (hasEnoughData) {
    const lookback = sortedMonths.slice(-forecastSettings.lookbackMonths);
    const amounts = lookback.map(m => incomeByMonth[m]);
    
    if (forecastSettings.method === 'linear') {
      // Linear trend based on the lookback period
      const trend = (amounts[amounts.length - 1] - amounts[0]) / (amounts.length - 1);
      forecastAmount = amounts[amounts.length - 1] + (trend * forecastSettings.growthMultiplier);
    } else if (forecastSettings.method === 'moving_average') {
      // Simple moving average
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      forecastAmount = average * forecastSettings.growthMultiplier;
    } else if (forecastSettings.method === 'conservative') {
      // 80% of the last month's value or average, whichever is lower
      const lastMonth = amounts[amounts.length - 1];
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      forecastAmount = Math.min(lastMonth, average) * 0.8 * forecastSettings.growthMultiplier;
    }

    if (forecastAmount < 0) forecastAmount = 0;
    
    const lastMonthAmount = amounts[amounts.length - 1];
    forecastGrowth = lastMonthAmount > 0 ? ((forecastAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Goals & Forecasting</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your progress and predict future income</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Target className="w-4 h-4" />
          Set Goal
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 transition-colors duration-200">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Set New Goal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              >
                <option value="income">Income</option>
                <option value="profit">Profit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount ({currency.symbol})</label>
              <input 
                type="number" 
                required
                value={formData.target_amount}
                onChange={e => setFormData({...formData, target_amount: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input 
                type="date" 
                required
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          // Calculate current amount dynamically based on transactions
          const goalMonth = goal.month?.substring(0, 7) || '';
          let currentAmount = 0;
          if (goal.type === 'income') {
            currentAmount = transactions
              .filter(t => t.type === 'income' && t.date.startsWith(goalMonth))
              .reduce((sum, t) => sum + t.amount, 0);
          } else if (goal.type === 'profit') {
            const income = transactions
              .filter(t => t.type === 'income' && t.date.startsWith(goalMonth))
              .reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions
              .filter(t => t.type === 'expense' && t.date.startsWith(goalMonth))
              .reduce((sum, t) => sum + t.amount, 0);
            currentAmount = income - expenses;
          }

          const targetAmount = goal.target_amount || 1;
          const progress = Math.min(100, (currentAmount / targetAmount) * 100);
          const isCompleted = progress >= 100;
          
          let progressColor = 'bg-blue-600';
          let textColor = 'text-blue-600';
          let bgColor = 'bg-blue-50';
          
          if (isCompleted) {
            progressColor = 'bg-emerald-500';
            textColor = 'text-emerald-600';
            bgColor = 'bg-emerald-50';
          } else if (progress >= 75) {
            progressColor = 'bg-amber-500';
            textColor = 'text-amber-600';
            bgColor = 'bg-amber-50';
          } else if (progress < 25) {
            progressColor = 'bg-red-500';
            textColor = 'text-red-600';
            bgColor = 'bg-red-50';
          }

          return (
            <motion.div 
              key={goal.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-sm border overflow-hidden group hover:shadow-xl transition-all duration-500 ${
                isCompleted 
                ? 'border-emerald-200 dark:border-emerald-800 shadow-emerald-500/10 ring-1 ring-emerald-100 dark:ring-emerald-900 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-900/10' 
                : 'border-slate-100 dark:border-slate-800 hover:shadow-blue-500/5'
              }`}
            >
              {isCompleted && (
                <>
                  <Confetti />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                  />
                </>
              )}
              <div className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        goal.type === 'income' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {goal.type}
                      </span>
                      <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {goal.month ? new Date(goal.month + (goal.month.length === 7 ? '-01T00:00:00' : 'T00:00:00')).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {goal.type === 'income' ? 'Revenue Target' : 'Profit Target'}
                      </h3>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.5 }}
                        >
                          <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500/20 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <CircularProgress 
                    progress={progress} 
                    color={isCompleted ? 'text-emerald-500' : progress >= 75 ? 'text-blue-500' : 'text-slate-400'} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black transition-colors duration-500 ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {formatCurrency(currentAmount)}
                        </span>
                        <span className="text-xs font-medium text-slate-400">/ {formatCurrency(goal.target_amount)}</span>
                      </div>
                    </div>
                    {isCompleted ? (
                      <div className="flex flex-col items-end gap-2">
                        <motion.div 
                          initial={{ rotate: -15, scale: 0.8 }}
                          animate={{ rotate: 0, scale: 1 }}
                          className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Achieved</span>
                        </motion.div>
                        <button className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline">
                          <Share2 className="w-3 h-3" />
                          Share Success
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaining</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {formatCurrency(Math.max(0, targetAmount - currentAmount))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner transition-colors duration-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className={`absolute inset-y-0 left-0 rounded-full shadow-lg ${
                        isCompleted 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-700'
                      }`}
                    >
                      {/* Animated Shimmer Effect */}
                      <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      
                      {/* Progress Glow */}
                      <div className={`absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 blur-md rounded-full ${
                        isCompleted ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {Math.round(progress)}% Complete
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isCompleted ? 'Goal Celebrated' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors duration-200">
            <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Goals Set</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Set income or profit goals to track your progress.</p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Income Forecast</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Based on historical data</p>
            </div>
          </div>
          <button 
            onClick={() => setShowForecastSettings(!showForecastSettings)}
            className={`p-2 rounded-xl transition-all ${showForecastSettings ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            title="Forecast Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence>
          {showForecastSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Forecasting Method</label>
                  <div className="flex flex-col gap-2">
                    {['linear', 'moving_average', 'conservative'].map(method => (
                      <button
                        key={method}
                        onClick={() => setForecastSettings({ ...forecastSettings, method })}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${forecastSettings.method === method ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                      >
                        {method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Lookback Period ({forecastSettings.lookbackMonths} months)</label>
                  <input 
                    type="range" 
                    min="3" 
                    max="12" 
                    step="1"
                    value={forecastSettings.lookbackMonths}
                    onChange={(e) => setForecastSettings({ ...forecastSettings, lookbackMonths: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>3M</span>
                    <span>6M</span>
                    <span>12M</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Growth Multiplier ({forecastSettings.growthMultiplier}x)</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1"
                    value={forecastSettings.growthMultiplier}
                    onChange={(e) => setForecastSettings({ ...forecastSettings, growthMultiplier: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {hasEnoughData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-colors duration-200">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Next Month Forecast</p>
              <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(forecastAmount)}</h4>
              <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${forecastGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                <TrendingUp className={`w-4 h-4 ${forecastGrowth < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(forecastGrowth).toFixed(1)}% vs last month
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Historical Trend</h4>
              <div className="h-40 flex items-end gap-3">
                {sortedMonths.slice(-6).map(month => {
                  const maxAmount = Math.max(...sortedMonths.slice(-6).map(m => incomeByMonth[m]), forecastAmount) || 1;
                  const height = `${(incomeByMonth[month] / maxAmount) * 100}%`;
                  return (
                    <div key={month} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                      <div className="w-full relative group flex-1 flex items-end">
                        <div className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600" style={{ height }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                          {formatCurrency(incomeByMonth[month])}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{month.substring(5, 7)}/{month.substring(2, 4)}</span>
                    </div>
                  );
                })}
                <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <div className="w-full relative group flex-1 flex items-end">
                    <div className="w-full bg-emerald-400 rounded-t-md transition-all opacity-70 border border-dashed border-emerald-500 hover:opacity-90" style={{ height: `${(forecastAmount / (Math.max(...sortedMonths.slice(-6).map(m => incomeByMonth[m]), forecastAmount) || 1)) * 100}%` }}></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                      {formatCurrency(forecastAmount)}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Next</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center transition-colors duration-200">
            <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="text-slate-900 dark:text-white font-medium">Forecasting Model Training</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              We need at least 3 months of historical data to generate accurate forecasts. Keep logging your income and expenses!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

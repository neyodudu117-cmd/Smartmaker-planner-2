import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    target_amount: '',
    month: new Date().toISOString().substring(0, 7)
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
          target_amount: parseFloat(formData.target_amount),
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
  const hasEnoughData = sortedMonths.length >= 3;

  let forecastAmount = 0;
  let forecastGrowth = 0;

  if (hasEnoughData) {
    const last3Months = sortedMonths.slice(-3);
    const amounts = last3Months.map(m => incomeByMonth[m]);
    
    // Trend: difference between last month and first month of the 3-month period
    const trend = (amounts[2] - amounts[0]) / 2; // average monthly change
    
    forecastAmount = amounts[2] + trend;
    if (forecastAmount < 0) forecastAmount = 0;

    forecastGrowth = amounts[2] > 0 ? (trend / amounts[2]) * 100 : 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Goals & Forecasting</h2>
          <p className="text-sm text-slate-500 mt-1">Track your progress and predict future income</p>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Set New Goal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Goal Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="income">Income</option>
                <option value="profit">Profit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount ($)</label>
              <input 
                type="number" 
                required
                value={formData.target_amount}
                onChange={e => setFormData({...formData, target_amount: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
              <input 
                type="month" 
                required
                value={formData.month}
                onChange={e => setFormData({...formData, month: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
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
          let currentAmount = 0;
          if (goal.type === 'income') {
            currentAmount = transactions
              .filter(t => t.type === 'income' && t.date.startsWith(goal.month))
              .reduce((sum, t) => sum + t.amount, 0);
          } else if (goal.type === 'profit') {
            const income = transactions
              .filter(t => t.type === 'income' && t.date.startsWith(goal.month))
              .reduce((sum, t) => sum + t.amount, 0);
            const expenses = transactions
              .filter(t => t.type === 'expense' && t.date.startsWith(goal.month))
              .reduce((sum, t) => sum + t.amount, 0);
            currentAmount = income - expenses;
          }

          const progress = Math.min(100, (currentAmount / goal.target_amount) * 100);
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 capitalize">{goal.type} Goal</h3>
                  <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {goal.month}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-slate-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.max(0, progress)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-2">
                  <span>${currentAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  <span>Target: ${goal.target_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Goals Set</h3>
            <p className="text-sm text-slate-500 mt-2">Set income or profit goals to track your progress.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Income Forecast</h3>
            <p className="text-sm text-slate-500">Based on historical data</p>
          </div>
        </div>
        
        {hasEnoughData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
              <p className="text-sm font-medium text-slate-500 mb-1">Next Month Forecast</p>
              <h4 className="text-3xl font-bold text-slate-900">${forecastAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h4>
              <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${forecastGrowth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 ${forecastGrowth < 0 ? 'rotate-180' : ''}`} />
                {Math.abs(forecastGrowth).toFixed(1)}% vs last month
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-700 mb-4">Historical Trend</h4>
              <div className="h-40 flex items-end gap-3">
                {sortedMonths.slice(-6).map(month => {
                  const maxAmount = Math.max(...sortedMonths.slice(-6).map(m => incomeByMonth[m]), forecastAmount);
                  const height = `${(incomeByMonth[month] / maxAmount) * 100}%`;
                  return (
                    <div key={month} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                      <div className="w-full relative group flex-1 flex items-end">
                        <div className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600" style={{ height }}></div>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                          ${incomeByMonth[month].toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{month.substring(5, 7)}/{month.substring(2, 4)}</span>
                    </div>
                  );
                })}
                <div className="flex-1 h-full flex flex-col justify-end items-center gap-2">
                  <div className="w-full relative group flex-1 flex items-end">
                    <div className="w-full bg-emerald-400 rounded-t-md transition-all opacity-70 border border-dashed border-emerald-500 hover:opacity-90" style={{ height: `${(forecastAmount / Math.max(...sortedMonths.slice(-6).map(m => incomeByMonth[m]), forecastAmount)) * 100}%` }}></div>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                      ${forecastAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600">Next</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h4 className="text-slate-900 font-medium">Forecasting Model Training</h4>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              We need at least 3 months of historical data to generate accurate forecasts. Keep logging your income and expenses!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

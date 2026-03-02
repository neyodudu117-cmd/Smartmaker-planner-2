import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link as LinkIcon, MousePointerClick, ShoppingCart, DollarSign } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useCurrency } from '../lib/currency';

export default function Affiliate() {
  const { currency, formatCurrency } = useCurrency();
  const [programs, setPrograms] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    clicks: '',
    conversions: '',
    commissions: ''
  });

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setPrograms(data.affiliatePrograms || []))
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  }, []);

  const totalClicks = programs.reduce((acc, p) => acc + p.clicks, 0);
  const totalConversions = programs.reduce((acc, p) => acc + p.conversions, 0);
  const totalCommissions = programs.reduce((acc, p) => acc + p.commissions, 0);
  const avgConversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00';
  const epc = totalClicks > 0 ? (totalCommissions / totalClicks).toFixed(2) : '0.00';

  const chartData = programs.map(p => ({
    name: p.name,
    Clicks: p.clicks,
    Conversions: p.conversions,
    Commissions: p.commissions
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const clicks = parseInt(formData.clicks) || 0;
    const conversions = parseInt(formData.conversions) || 0;
    const commissions = parseFloat(formData.commissions) || 0;

    if (clicks < 0 || conversions < 0 || commissions < 0) {
      alert('Clicks, conversions, and commissions must be non-negative numbers.');
      return;
    }

    try {
      await apiFetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          clicks,
          conversions,
          commissions
        })
      });
      
      setIsAdding(false);
      setFormData({ name: '', clicks: '', conversions: '', commissions: '' });
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => setPrograms(data.affiliatePrograms || []))
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to add program:", err);
      alert("Failed to add program. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Affiliate Performance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track clicks, conversions, and commissions</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <LinkIcon className="w-4 h-4" />
          Add Program
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 transition-colors duration-200">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add Affiliate Program</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Program Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="e.g. Amazon Associates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Clicks</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.clicks}
                onChange={e => setFormData({...formData, clicks: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conversions</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.conversions}
                onChange={e => setFormData({...formData, conversions: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Commissions Earned ({currency.symbol})</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={formData.commissions}
                onChange={e => setFormData({...formData, commissions: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
                Save Program
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clicks</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalClicks.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Conversions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalConversions.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Conv. Rate</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{avgConversionRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">EPC (Earnings Per Click)</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(parseFloat(epc))}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Commissions by Program</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-slate-200)" className="dark:opacity-10" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--color-slate-500)', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--color-slate-500)', fontSize: 12}} dx={-10} tickFormatter={(value) => `${currency.symbol}${value}`} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: 'var(--tw-colors-white)',
                  color: 'var(--tw-colors-slate-900)'
                }}
                cursor={{fill: 'var(--tw-colors-slate-50)'}}
                wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-white"
                formatter={(value: number) => [`${currency.symbol}${value.toLocaleString()}`, 'Commissions']}
              />
              <Bar dataKey="Commissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
          <h3 className="font-semibold text-slate-900 dark:text-white">Program Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
              <tr>
                <th className="px-6 py-4 font-medium">Program Name</th>
                <th className="px-6 py-4 font-medium text-right">Clicks</th>
                <th className="px-6 py-4 font-medium text-right">Conversions</th>
                <th className="px-6 py-4 font-medium text-right">Conv. Rate</th>
                <th className="px-6 py-4 font-medium text-right">Commissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {programs.map((p) => {
                const rate = p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(2) : '0.00';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white transition-colors">{p.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 transition-colors">{p.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 transition-colors">{p.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400 transition-colors">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 transition-colors">
                        {rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400 transition-colors">
                      {formatCurrency(p.commissions)}
                    </td>
                  </tr>
                );
              })}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 transition-colors">
                    No affiliate programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

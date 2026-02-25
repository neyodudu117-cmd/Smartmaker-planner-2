import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link as LinkIcon, MousePointerClick, ShoppingCart, DollarSign } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Affiliate() {
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
    
    const clicks = parseInt(formData.clicks);
    const conversions = parseInt(formData.conversions);
    const commissions = parseFloat(formData.commissions);

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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Affiliate Performance</h2>
          <p className="text-sm text-slate-500 mt-1">Track clicks, conversions, and commissions</p>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add Affiliate Program</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Amazon Associates"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Clicks</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.clicks}
                onChange={e => setFormData({...formData, clicks: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Conversions</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.conversions}
                onChange={e => setFormData({...formData, conversions: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Commissions Earned ($)</label>
              <input 
                type="number" 
                required
                min="0"
                step="0.01"
                value={formData.commissions}
                onChange={e => setFormData({...formData, commissions: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
                Save Program
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Clicks</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{totalClicks.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Conversions</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{totalConversions.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Conv. Rate</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{avgConversionRate}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">EPC (Earnings Per Click)</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">${epc}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Commissions by Program</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f8fafc'}}
              />
              <Bar dataKey="Commissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Program Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Program Name</th>
                <th className="px-6 py-4 font-medium text-right">Clicks</th>
                <th className="px-6 py-4 font-medium text-right">Conversions</th>
                <th className="px-6 py-4 font-medium text-right">Conv. Rate</th>
                <th className="px-6 py-4 font-medium text-right">Commissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programs.map((p) => {
                const rate = p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(2) : '0.00';
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{p.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{p.conversions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {rate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                      ${p.commissions.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                );
              })}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
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

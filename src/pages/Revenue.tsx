import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { apiFetch } from '../lib/api';

export default function Revenue() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Affiliate',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions?.filter((t: any) => t.type === 'income') || []);
      })
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'income',
          amount: parseFloat(formData.amount)
        })
      });
      
      setIsAdding(false);
      // Refresh data
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions?.filter((t: any) => t.type === 'income') || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to add income:", err);
      alert("Failed to add income. Please try again.");
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.category ? t.category === filters.category : true;
    const matchesStartDate = filters.startDate ? new Date(t.date) >= new Date(filters.startDate) : true;
    const matchesEndDate = filters.endDate ? new Date(t.date) <= new Date(filters.endDate) : true;
    
    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const monthlySummary = transactions.reduce((acc: Record<string, number>, t: any) => {
    const month = t.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlySummary).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your income streams</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">New Income Entry</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Affiliate</option>
                <option>Digital Product</option>
                <option>Sponsorship</option>
                <option>Consulting</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Amazon Associates Oct"
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
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {sortedMonths.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedMonths.slice(0, 4).map(month => (
            <div key={month} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{format(parseISO(month + '-01'), 'MMMM yyyy')}</p>
                <h3 className="text-2xl font-bold text-slate-900">${monthlySummary[month].toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Affiliate">Affiliate</option>
                <option value="Digital Product">Digital Product</option>
                <option value="Sponsorship">Sponsorship</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button 
                onClick={() => setFilters({ startDate: '', endDate: '', category: '' })}
                className="text-sm text-slate-500 hover:text-slate-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 hover:shadow-sm transition-all duration-200 cursor-pointer relative z-0 hover:z-10 group">
                  <td className="px-6 py-4 text-slate-600 group-hover:text-slate-900 transition-colors">{t.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 group-hover:bg-blue-100 transition-colors">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">
                    +${t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No income transactions found.
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

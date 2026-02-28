import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Calendar, Trash2, Tag, CheckSquare, Square, Pencil } from 'lucide-react';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [isBulkCategorizing, setIsBulkCategorizing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
      if (editingId) {
        await apiFetch(`/api/transactions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            amount: parseFloat(formData.amount) || 0
          })
        });
      } else {
        await apiFetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            type: 'income',
            amount: parseFloat(formData.amount) || 0
          })
        });
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        amount: '',
        category: 'Affiliate',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      // Refresh data
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions?.filter((t: any) => t.type === 'income') || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to save income:", err);
      alert("Failed to save income. Please try again.");
    }
  };

  const handleEdit = (t: any) => {
    setFormData({
      amount: t.amount.toString(),
      category: t.category,
      date: t.date,
      description: t.description
    });
    setEditingId(t.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTransactions.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) return;
    
    try {
      await apiFetch('/api/transactions/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      
      setSelectedIds([]);
      // Refresh data
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions?.filter((t: any) => t.type === 'income') || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to delete transactions:", err);
      alert("Failed to delete transactions.");
    }
  };

  const handleBulkCategorize = async () => {
    if (!bulkCategory) return;
    
    try {
      await apiFetch('/api/transactions/bulk-categorize', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, category: bulkCategory })
      });
      
      setSelectedIds([]);
      setIsBulkCategorizing(false);
      setBulkCategory('');
      // Refresh data
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions?.filter((t: any) => t.type === 'income') || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to categorize transactions:", err);
      alert("Failed to categorize transactions.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Revenue</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your income streams</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) {
              setEditingId(null);
              setFormData({
                amount: '',
                category: 'Affiliate',
                date: new Date().toISOString().split('T')[0],
                description: ''
              });
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Income Entry' : 'New Income Entry'}</h3>
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
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {editingId ? 'Update Entry' : 'Save Entry'}
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

        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-3 px-4 flex items-center justify-between">
            <div className="text-sm font-medium text-blue-800">
              {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              {isBulkCategorizing ? (
                <div className="flex items-center gap-2">
                  <select 
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="border border-blue-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Select Category...</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Digital Product">Digital Product</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                  <button 
                    onClick={handleBulkCategorize}
                    disabled={!bulkCategory}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Apply
                  </button>
                  <button 
                    onClick={() => { setIsBulkCategorizing(false); setBulkCategory(''); }}
                    className="px-3 py-1.5 text-blue-700 text-sm font-medium hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setIsBulkCategorizing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Categorize
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className={`hover:bg-slate-50 transition-all duration-200 cursor-pointer relative z-0 hover:z-10 group ${selectedIds.includes(t.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.includes(t.id)}
                      onChange={() => handleSelectOne(t.id)}
                    />
                  </td>
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
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(t);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit transaction"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
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

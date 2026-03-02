import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Receipt, ShieldCheck, Calendar, Download, Trash2, Tag, Pencil } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { apiFetch } from '../lib/api';
import { useCurrency } from '../lib/currency';

export default function Expenses() {
  const { currency, formatCurrency } = useCurrency();
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
    category: 'Software',
    date: new Date().toISOString().split('T')[0],
    description: '',
    is_tax_deductible: true
  });

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions?.filter((t: any) => t.type === 'expense') || []);
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
            type: 'expense',
            amount: parseFloat(formData.amount) || 0
          })
        });
      }
      
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        amount: '',
        category: 'Software',
        date: new Date().toISOString().split('T')[0],
        description: '',
        is_tax_deductible: true
      });
      // Refresh data
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions?.filter((t: any) => t.type === 'expense') || []);
        })
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to save expense:", err);
      alert("Failed to save expense. Please try again.");
    }
  };

  const handleEdit = (t: any) => {
    setFormData({
      amount: t.amount.toString(),
      category: t.category,
      date: t.date,
      description: t.description,
      is_tax_deductible: t.is_tax_deductible
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

  const totalExpenses = filteredTransactions.reduce((acc, t) => acc + t.amount, 0);
  const taxDeductible = filteredTransactions.filter(t => t.is_tax_deductible).reduce((acc, t) => acc + t.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Tax Deductible', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((t: any) => 
        [
          t.date, 
          `"${t.description}"`, 
          t.category, 
          t.is_tax_deductible ? 'Yes' : 'No',
          t.amount
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'smartmaker_expenses.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          setTransactions(data.transactions?.filter((t: any) => t.type === 'expense') || []);
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
          setTransactions(data.transactions?.filter((t: any) => t.type === 'expense') || []);
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">Expenses</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your business costs</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (!isAdding) {
                setEditingId(null);
                setFormData({
                  amount: '',
                  category: 'Software',
                  date: new Date().toISOString().split('T')[0],
                  description: '',
                  is_tax_deductible: true
                });
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(totalExpenses)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tax Deductible</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{formatCurrency(taxDeductible)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 transition-colors duration-200">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editingId ? 'Edit Expense Entry' : 'New Expense Entry'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ({currency.symbol})</label>
              <input 
                type="number" 
                required
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              >
                <option>Software</option>
                <option>Marketing</option>
                <option>Contractors</option>
                <option>Equipment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input 
                type="text" 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                placeholder="e.g. Vercel Hosting"
              />
            </div>
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between mt-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.is_tax_deductible ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Tax Deductible</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mark this expense for tax reporting</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_tax_deductible}
                onClick={() => setFormData({...formData, is_tax_deductible: !formData.is_tax_deductible})}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.is_tax_deductible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_tax_deductible ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
            <div key={month} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{format(parseISO(month + '-01'), 'MMMM yyyy')}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlySummary[month])}</h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        
        {showFilters && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors duration-200">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select 
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
              >
                <option value="">All Categories</option>
                <option value="Software">Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Contractors">Contractors</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button 
                onClick={() => setFilters({ startDate: '', endDate: '', category: '' })}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 p-3 px-4 flex items-center justify-between transition-colors duration-200">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              {isBulkCategorizing ? (
                <div className="flex items-center gap-2">
                  <select 
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <option value="">Select Category...</option>
                    <option value="Software">Software</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Contractors">Contractors</option>
                    <option value="Equipment">Equipment</option>
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
                    className="px-3 py-1.5 text-blue-700 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setIsBulkCategorizing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    Categorize
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
              <tr>
                <th className="px-6 py-4 font-medium w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-center">Tax Deductible</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative z-0 hover:z-10 group ${selectedIds.includes(t.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={selectedIds.includes(t.id)}
                      onChange={() => handleSelectOne(t.id)}
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 transition-colors">{t.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white transition-colors">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {t.is_tax_deductible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 transition-colors">
                        <ShieldCheck className="w-3 h-3" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400 transition-colors">
                    -{formatCurrency(t.amount)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(t);
                      }}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit transaction"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 transition-colors">
                    No expense transactions found.
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

import React, { useState, useEffect } from 'react';
import { ShoppingBag, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function DigitalProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sales: '',
    gross_revenue: '',
    platform_fee: ''
  });

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setProducts(data.digitalProducts || []))
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  }, []);

  const totalSales = products.reduce((acc, p) => acc + p.sales, 0);
  const totalGross = products.reduce((acc, p) => acc + p.gross_revenue, 0);
  const totalFees = products.reduce((acc, p) => acc + p.platform_fee, 0);
  const totalNet = totalGross - totalFees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sales: parseInt(formData.sales),
          gross_revenue: parseFloat(formData.gross_revenue),
          platform_fee: parseFloat(formData.platform_fee)
        })
      });
      
      setIsAdding(false);
      setFormData({ name: '', sales: '', gross_revenue: '', platform_fee: '' });
      apiFetch('/api/dashboard')
        .then(res => res.json())
        .then(data => setProducts(data.digitalProducts || []))
        .catch(err => console.error("Failed to fetch dashboard data:", err));
    } catch (err) {
      console.error("Failed to add product:", err);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Digital Products</h2>
          <p className="text-sm text-slate-500 mt-1">Track sales, gross revenue, and platform fees</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add Digital Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Creator Ebook"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Sales</label>
              <input 
                type="number" 
                required
                value={formData.sales}
                onChange={e => setFormData({...formData, sales: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gross Revenue ($)</label>
              <input 
                type="number" 
                required
                step="0.01"
                value={formData.gross_revenue}
                onChange={e => setFormData({...formData, gross_revenue: e.target.value})}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Platform Fees ($)</label>
              <input 
                type="number" 
                required
                step="0.01"
                value={formData.platform_fee}
                onChange={e => setFormData({...formData, platform_fee: e.target.value})}
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
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Sales</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{totalSales.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Gross Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">${totalGross.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Platform Fees</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">${totalFees.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">${totalNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900">Product Performance Ranking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium text-right">Sales</th>
                <th className="px-6 py-4 font-medium text-right">Gross Revenue</th>
                <th className="px-6 py-4 font-medium text-right">Platform Fees</th>
                <th className="px-6 py-4 font-medium text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...products].sort((a, b) => b.sales - a.sales).map((p, index) => {
                const net = p.gross_revenue - p.platform_fee;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">#{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{p.sales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      ${p.gross_revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-right text-red-500">
                      -${p.platform_fee.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                      ${net.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No digital products found.
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

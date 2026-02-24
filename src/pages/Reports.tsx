import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Reports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const { summary, transactions } = data;

  const incomeByCategory = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expensesByCategory = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Tax Deductible'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t: any) => 
        [
          t.date, 
          t.type, 
          t.category, 
          `"${t.description}"`, 
          t.amount, 
          t.is_tax_deductible ? 'Yes' : 'No'
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'smartmaker_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Profit & Loss statements and exports</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Profit & Loss Statement</h3>
              <p className="text-sm text-slate-500">Year to Date (2023)</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 border border-slate-200 rounded-lg bg-white">
            <Calendar className="w-4 h-4" />
            This Year
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Income Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Income</h4>
            <div className="space-y-3">
              {Object.keys(incomeByCategory).map(category => (
                <div key={category} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{category}</span>
                  <span className="font-medium text-slate-900">${incomeByCategory[category].toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-900">Total Income</span>
                <span className="text-emerald-600">${summary.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Expenses</h4>
            <div className="space-y-3">
              {Object.keys(expensesByCategory).map(category => (
                <div key={category} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">{category}</span>
                  <span className="font-medium text-slate-900">${expensesByCategory[category].toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-100">
                <span className="text-slate-900">Total Expenses</span>
                <span className="text-red-600">${summary.expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
            <span className="font-bold text-slate-900 text-lg">Net Profit</span>
            <span className="font-bold text-blue-600 text-xl">${summary.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function Reports() {
  const [data, setData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error("Failed to fetch dashboard data:", err));
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (data.error) return <div className="flex items-center justify-center h-64 text-red-500">Error: {data.error}</div>;

  const { transactions = [], summary = { revenue: 0, expenses: 0, netProfit: 0 } } = data;

  const filteredTransactions = transactions.filter((t: any) => t.date.startsWith(selectedYear));

  const incomeByCategory = filteredTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const expensesByCategory = filteredTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const totalRevenue = filteredTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Calculate monthly summaries
  const monthlySummaries = filteredTransactions.reduce((acc: any, t: any) => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else if (t.type === 'expense') {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlySummaries).sort((a, b) => b.localeCompare(a));

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

      {/* Monthly Summaries */}
      {sortedMonths.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-semibold text-slate-900">Monthly Summaries ({selectedYear})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Month</th>
                  <th className="px-6 py-4 font-medium text-right">Income</th>
                  <th className="px-6 py-4 font-medium text-right">Expenses</th>
                  <th className="px-6 py-4 font-medium text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedMonths.map((month) => {
                  const data = monthlySummaries[month];
                  const profit = data.income - data.expense;
                  const date = new Date(month + '-01');
                  const monthName = date.toLocaleString('default', { month: 'long' });
                  
                  return (
                    <tr key={month} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{monthName}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                        ${data.income.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right text-red-600 font-medium">
                        ${data.expense.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${profit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Profit & Loss Statement</h3>
              <p className="text-sm text-slate-500">Year to Date ({selectedYear})</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="date"
              value={`${selectedYear}-01-01`}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setSelectedYear(val.substring(0, 4));
                }
              }}
              className="appearance-none flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
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
                <span className="text-emerald-600">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
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
                <span className="text-red-600">${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
            <span className="font-bold text-slate-900 text-lg">Net Profit</span>
            <span className="font-bold text-blue-600 text-xl">${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

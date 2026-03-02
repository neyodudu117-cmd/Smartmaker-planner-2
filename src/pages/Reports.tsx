import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, PieChart, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../lib/currency';

export default function Reports() {
  const { currency, formatCurrency } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
        setData({ error: err.message });
      });
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (data.error) return <div className="flex items-center justify-center h-64 text-red-500">Error: {data.error}</div>;

  const { transactions = [] } = data;

  const filteredTransactions = transactions.filter((t: any) => t.date.startsWith(selectedYear));

  const incomeByCategory = filteredTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const EXPENSE_CATEGORIES = ['Software', 'Marketing', 'Contractors', 'Equipment', 'Other'];

  const expensesByCategory = EXPENSE_CATEGORIES.reduce((acc: any, category: string) => {
    acc[category] = 0;
    return acc;
  }, {});

  filteredTransactions
    .filter((t: any) => t.type === 'expense')
    .forEach((t: any) => {
      if (expensesByCategory[t.category] !== undefined) {
        expensesByCategory[t.category] += t.amount;
      } else {
        expensesByCategory['Other'] = (expensesByCategory['Other'] || 0) + t.amount;
      }
    });

  const totalRevenue = filteredTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const netProfit = totalRevenue - totalExpenses;

  // Calculate previous year data for comparison
  const previousYear = (parseInt(selectedYear) - 1).toString();
  const prevYearTransactions = transactions.filter((t: any) => t.date.startsWith(previousYear));
  
  const prevTotalRevenue = prevYearTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const prevTotalExpenses = prevYearTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const prevNetProfit = prevTotalRevenue - prevTotalExpenses;

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const revenueChange = calculatePercentageChange(totalRevenue, prevTotalRevenue);
  const expensesChange = calculatePercentageChange(totalExpenses, prevTotalExpenses);
  const profitChange = calculatePercentageChange(netProfit, prevNetProfit);

  const largestIncomeCategory = Object.keys(incomeByCategory).length > 0 
    ? Object.keys(incomeByCategory).reduce((a, b) => incomeByCategory[a] > incomeByCategory[b] ? a : b) 
    : null;

  const largestExpenseCategory = Object.keys(expensesByCategory).length > 0
    ? Object.keys(expensesByCategory).reduce((a, b) => expensesByCategory[a] > expensesByCategory[b] ? a : b)
    : null;

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
      ...filteredTransactions.map((t: any) => 
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">Financial Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Profit & Loss statements and exports</p>
        </div>
        <div className="flex items-center gap-4">
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
              className="appearance-none flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            />
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" />
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Financial Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {revenueChange !== 0 && (
              <span className={`flex items-center font-bold ${revenueChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {revenueChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(revenueChange).toFixed(1)}%
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400">vs last year</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalExpenses)}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {expensesChange !== 0 && (
              <span className={`flex items-center font-bold ${expensesChange < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {expensesChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(expensesChange).toFixed(1)}%
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400">vs last year</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors duration-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(netProfit)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {profitChange !== 0 && (
              <span className={`flex items-center font-bold ${profitChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {profitChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(profitChange).toFixed(1)}%
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400">vs last year</span>
          </div>
        </div>
      </div>

      {/* Monthly Summaries */}
      {sortedMonths.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-6 transition-colors duration-200">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
            <h3 className="font-semibold text-slate-900 dark:text-white">Monthly Summaries ({selectedYear})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Month</th>
                  <th className="px-6 py-4 font-medium text-right">Income</th>
                  <th className="px-6 py-4 font-medium text-right">Expenses</th>
                  <th className="px-6 py-4 font-medium text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedMonths.map((month) => {
                  const data = monthlySummaries[month];
                  const profit = data.income - data.expense;
                  const date = new Date(month + '-01');
                  const monthName = date.toLocaleString('default', { month: 'long' });
                  
                  return (
                    <tr key={month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white transition-colors">{monthName}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium transition-colors">
                        {formatCurrency(data.income)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-medium transition-colors">
                        {formatCurrency(data.expense)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold transition-colors ${profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Profit & Loss Statement</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Year to Date ({selectedYear})</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Income Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors duration-200">Income</h4>
            <div className="space-y-3">
              {Object.keys(incomeByCategory).map(category => {
                const isLargest = category === largestIncomeCategory && incomeByCategory[category] > 0;
                return (
                <div key={category} className={`flex justify-between items-center text-sm ${isLargest ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}`}>
                  <span className={isLargest ? '' : 'text-slate-600 dark:text-slate-400 transition-colors'}>{category}</span>
                  <span className={isLargest ? '' : 'font-medium text-slate-900 dark:text-white transition-colors'}>{formatCurrency(incomeByCategory[category])}</span>
                </div>
              )})}
              <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <span className="text-slate-900 dark:text-white">Total Income</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors duration-200">Expenses</h4>
            <div className="space-y-3">
              {Object.keys(expensesByCategory).map(category => {
                const isLargest = category === largestExpenseCategory && expensesByCategory[category] > 0;
                return (
                <div key={category} className={`flex justify-between items-center text-sm ${isLargest ? 'font-bold text-red-600 dark:text-red-400' : ''}`}>
                  <span className={isLargest ? '' : 'text-slate-600 dark:text-slate-400 transition-colors'}>{category}</span>
                  <span className={isLargest ? '' : 'font-medium text-slate-900 dark:text-white transition-colors'}>{formatCurrency(expensesByCategory[category])}</span>
                </div>
              )})}
              <div className="flex justify-between items-center text-sm font-bold pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors duration-200">
                <span className="text-slate-900 dark:text-white">Total Expenses</span>
                <span className="text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex justify-between items-center border border-slate-100 dark:border-slate-800 transition-colors duration-200">
            <span className="font-bold text-slate-900 dark:text-white text-lg">Net Profit</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Expense Breakdown Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3 transition-colors duration-200">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Expense Breakdown by Category</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Yearly distribution for {selectedYear}</p>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `${currency.symbol}${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: 'white',
                    color: '#1e293b'
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                  formatter={(value: number) => {
                    const percentage = totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : '0';
                    return [`${formatCurrency(value)} (${percentage}%)`, 'Amount'];
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {Object.entries(expensesByCategory).map(([name, _], index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={name === largestExpenseCategory ? '#ef4444' : '#94a3b8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

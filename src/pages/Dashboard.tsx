import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Link as LinkIcon, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { apiFetch } from '../lib/api';
import AILogoGenerator from '../components/AILogoGenerator';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function CountUp({ value, prefix = '', suffix = '', decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 1500; // 1.5 seconds
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCount(startValue + (value - startValue) * easeProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  return <>{prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>;
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [showLogoGenerator, setShowLogoGenerator] = useState(false);

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

  const { summary = { revenue: 0, expenses: 0, netProfit: 0, affiliateEarnings: 0 }, transactions = [], affiliatePrograms = [], digitalProducts = [] } = data;

  const exchangeRate = 0.92; // 1 USD = 0.92 EUR
  const formatValue = (val: number) => currency === 'EUR' ? val * exchangeRate : val;
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  // Process data for charts
  const revenueByMonth = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: any, t: any) => {
      const month = t.date.substring(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {});

  const trendData = Object.keys(revenueByMonth).sort().map(month => ({
    name: month,
    Revenue: formatValue(revenueByMonth[month])
  }));

  const incomeByCategory = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((acc: any, t: any) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieData = Object.keys(incomeByCategory).map(key => ({
    name: key,
    value: formatValue(incomeByCategory[key])
  }));

  const topAffiliate = [...affiliatePrograms].sort((a, b) => b.commissions - a.commissions)[0];
  const topProduct = [...digitalProducts].sort((a, b) => b.sales - a.sales)[0];

  return (
    <div className="space-y-6">
      {showLogoGenerator && <AILogoGenerator onClose={() => setShowLogoGenerator(false)} />}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowLogoGenerator(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Wand2 className="w-4 h-4" />
            Generate AI Logo
          </button>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR')}
            className="text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
          <div className="text-sm text-slate-500">Last updated: Just now</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2"><CountUp value={formatValue(summary.revenue)} prefix={currencySymbol} /></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">+12.5%</span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Expenses</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2"><CountUp value={formatValue(summary.expenses)} prefix={currencySymbol} /></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingDown className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">-2.4%</span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Net Profit</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2"><CountUp value={formatValue(summary.netProfit)} prefix={currencySymbol} /></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">+18.2%</span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Affiliate Earnings</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2"><CountUp value={formatValue(summary.affiliateEarnings)} prefix={currencySymbol} /></h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <LinkIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">+5.1%</span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 hover:shadow-md transition-all duration-300"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(value) => `${currencySymbol}${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${currencySymbol}${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6'}} 
                  activeDot={{r: 6, strokeWidth: 0, fill: '#3b82f6', style: { filter: 'drop-shadow(0px 0px 4px rgba(59, 130, 246, 0.5))' }}} 
                  isAnimationActive={true} 
                  animationDuration={1500} 
                  animationEasing="ease-out" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Income Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Income Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Amount']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600">{entry.name}</span>
                </div>
                <span className="font-medium text-slate-900">{currencySymbol}{entry.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Affiliate Program */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Affiliate Program</h3>
          {topAffiliate ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">{topAffiliate.name}</p>
                <p className="text-sm text-slate-500 mt-1">{topAffiliate.conversions} conversions</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{currencySymbol}{formatValue(topAffiliate.commissions).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-slate-500 mt-1">Earned</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No affiliate data available.</p>
          )}
        </motion.div>

        {/* Best Selling Product */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8, ease: "easeOut" }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Best Selling Product</h3>
          {topProduct ? (
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">{topProduct.name}</p>
                <p className="text-sm text-slate-500 mt-1">{topProduct.sales} sales</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600">{currencySymbol}{formatValue(topProduct.gross_revenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</p>
                <p className="text-sm text-slate-500 mt-1">Gross Revenue</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No product data available.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

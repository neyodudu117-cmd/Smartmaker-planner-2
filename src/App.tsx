import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Link as LinkIcon, ShoppingBag, Receipt, PieChart, Target, LogOut, Moon, Sun } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';
import { useTheme } from './lib/theme';
import { CurrencyProvider, useCurrency, CURRENCIES } from './lib/currency';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Revenue from './pages/Revenue';
import Affiliate from './pages/Affiliate';
import DigitalProducts from './pages/DigitalProducts';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Auth from './pages/Auth';
import FastAIAssistant from './components/FastAIAssistant';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Sidebar({ user }: { user: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Revenue', path: '/dashboard/revenue', icon: DollarSign },
    { name: 'Affiliate', path: '/dashboard/affiliate', icon: LinkIcon },
    { name: 'Digital Products', path: '/dashboard/products', icon: ShoppingBag },
    { name: 'Expenses', path: '/dashboard/expenses', icon: Receipt },
    { name: 'Reports', path: '/dashboard/reports', icon: PieChart },
    { name: 'Goals & Forecast', path: '/dashboard/goals', icon: Target },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-200">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl font-display">S</span>
          </div>
          SmartMaker
        </Link>
        <button 
          onClick={toggleTheme} 
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="px-6 mb-4">
        <div className="relative group">
          <select 
            value={currency.code}
            onChange={(e) => {
              const found = CURRENCIES.find(c => c.code === e.target.value);
              if (found) setCurrency(found);
            }}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
            <DollarSign className="w-3 h-3" />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                isActive 
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold shadow-sm ring-1 ring-blue-500/10 dark:ring-blue-400/20" 
                  : "text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase transition-colors duration-200 font-display">
              {user?.email?.charAt(0).toUpperCase() || 'D'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate w-24 transition-colors duration-200 font-display">{user?.user_metadata?.full_name || user?.email || 'Demo User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">Pro Plan</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({ children, user }: { children: React.ReactNode, user: any }) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      <Sidebar user={user} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <FastAIAssistant />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <CurrencyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={session ? <Navigate to="/dashboard" replace /> : <Auth />} />
          <Route path="/dashboard" element={<DashboardLayout user={session?.user}><Dashboard /></DashboardLayout>} />
          <Route path="/dashboard/revenue" element={<DashboardLayout user={session?.user}><Revenue /></DashboardLayout>} />
          <Route path="/dashboard/affiliate" element={<DashboardLayout user={session?.user}><Affiliate /></DashboardLayout>} />
          <Route path="/dashboard/products" element={<DashboardLayout user={session?.user}><DigitalProducts /></DashboardLayout>} />
          <Route path="/dashboard/expenses" element={<DashboardLayout user={session?.user}><Expenses /></DashboardLayout>} />
          <Route path="/dashboard/reports" element={<DashboardLayout user={session?.user}><Reports /></DashboardLayout>} />
          <Route path="/dashboard/goals" element={<DashboardLayout user={session?.user}><Goals /></DashboardLayout>} />
        </Routes>
      </Router>
    </CurrencyProvider>
  );
}

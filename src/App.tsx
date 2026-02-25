import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, DollarSign, Link as LinkIcon, ShoppingBag, Receipt, PieChart, Target, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';

import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Revenue from './pages/Revenue';
import Affiliate from './pages/Affiliate';
import DigitalProducts from './pages/DigitalProducts';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Goals from './pages/Goals';
import Auth from './pages/Auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Sidebar({ user }: { user: any }) {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          SmartMaker
        </Link>
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
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-sm ring-1 ring-blue-500/10" 
                  : "text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium uppercase">
              {user?.email?.substring(0, 2) || 'DU'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate w-24">{user?.user_metadata?.full_name || user?.email || 'Demo User'}</p>
              <p className="text-xs text-slate-500">Pro Plan</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sign out">
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
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
  );
}

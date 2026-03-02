import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, PieChart, TrendingUp, Shield, Zap, CheckCircle2, Moon, Sun } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useTheme } from '../lib/theme';

export default function LandingPage() {
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const { theme, toggleTheme } = useTheme();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 transition-colors duration-200">
      {/* Navbar */}
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">SmartMaker</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/auth" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white whitespace-nowrap transition-colors">Log in</Link>
            <Link to="/auth" className="text-sm font-medium bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
              <span className="hidden sm:inline">Go to </span>Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-400 blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Copy & CTAs */}
          <div className="text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] transition-colors duration-200"
            >
              Financial clarity for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
                modern creators.
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-xl transition-colors duration-200"
            >
              Track your affiliate income, digital product sales, and business expenses all in one beautiful, automated workspace.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 mb-6"
            >
              <Link to="/auth" className="w-full sm:w-auto px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-slate-800 dark:hover:bg-blue-700 hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-xl hover:shadow-slate-900/40 dark:hover:shadow-blue-900/40 flex items-center justify-center gap-2">
                Start Free
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-1 hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                See Demo
              </a>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 transition-colors duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Built for modern creators & digital entrepreneurs
            </motion.p>
          </div>

          {/* Right Side: 3D Mockup */}
          <div className="relative lg:h-[600px] flex items-center justify-center perspective-[2000px]">
            <motion.div 
              initial={{ opacity: 0, x: 40, rotateY: 20, rotateX: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotateY: -15, rotateX: 5, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-colors duration-200"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glassmorphism Header */}
              <div className="h-12 border-b border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 flex items-center px-4 gap-2 transition-colors duration-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-6 grid grid-cols-2 gap-4 h-[calc(100%-3rem)] overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-200">
                {/* Net Profit Widget */}
                <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-colors duration-200">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Profit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">$12,450.00</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>

                {/* Revenue Trend Chart Mockup */}
                <div className="col-span-2 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 h-40 flex flex-col transition-colors duration-200">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Revenue Trend</p>
                  <div className="flex-1 flex items-end gap-2">
                    {[40, 60, 45, 80, 65, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative group overflow-hidden transition-colors duration-200">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
                          className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-400 rounded-t-sm transition-colors duration-200"
                        ></motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Affiliate Panel Mockup */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Top Affiliate</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors duration-200">
                      <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Amazon</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">$4,200 earned</p>
                    </div>
                  </div>
                </div>

                {/* Products Panel Mockup */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Top Product</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors duration-200">
                      <Shield className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Ebook Sales</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">124 units</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-200" ref={featuresRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl transition-colors duration-200"
            >
              Master your creator finances
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors duration-200"
            >
              Gain total visibility into your income streams, optimize your affiliate earnings, and focus on what you do best—creating.
            </motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-800/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-200">Affiliate Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-200">Monitor clicks, conversions, and commissions across all your affiliate programs in real-time.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-800/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-200">Digital Products</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-200">Track sales, calculate platform fees, and see your true net profit from digital downloads.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-slate-800/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-200">Goal Forecasting</h3>
              <p className="text-slate-600 dark:text-slate-400 transition-colors duration-200">Set income targets and let our algorithms predict when you'll hit them based on historical data.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">SmartMaker</span>
          </div>
          <p>© 2025 SmartMaker. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Sun,
  Moon,
  Building2,
  User,
  ShieldCheck,
  RefreshCw,
  Globe,
  Bell,
  SlidersHorizontal,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav }) => {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    currentRole,
    setCurrentRole,
    settings,
    updateSettings,
    setShowModeSelectModal,
    resetToDemoData,
    workers,
    attendance,
  } = useApp();

  // Missing attendance calculation for today (2026-10-31)
  const today = '2026-10-31';
  const activeWorkers = workers.filter((w) => w.status === 'active');
  const markedToday = new Set(attendance.filter((a) => a.date === today).map((a) => a.workerId));
  const missingCount = activeWorkers.filter((w) => !markedToday.has(w.id)).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <div
            onClick={() => setShowModeSelectModal(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-emerald-500 transition-colors">
              W
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  WorkLedger <span className="text-emerald-600">Pro</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 hidden md:block">
                {mode === 'individual' ? 'Personal Work & Earnings Register' : settings.companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Mode Switcher Pill */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setMode('individual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'individual'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Individual</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'company'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company</span>
          </button>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Data Tag */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">Demo Data Active</span>
            <button
              onClick={resetToDemoData}
              title="Reset to fresh demo dataset"
              className="ml-1 hover:text-amber-900 dark:hover:text-amber-200"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Role selector in Company Mode */}
          {mode === 'company' && (
            <div className="hidden md:flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                title="Simulate Role Permissions"
              >
                <option value="admin">Role: Admin</option>
                <option value="attendance_manager">Role: Attendance Mgr</option>
                <option value="accountant">Role: Accountant</option>
                <option value="supervisor">Role: Supervisor</option>
                <option value="viewer">Role: Read-Only</option>
              </select>
            </div>
          )}

          {/* Missing attendance badge in Company Mode */}
          {mode === 'company' && missingCount > 0 && (
            <div
              title={`${missingCount} worker(s) attendance not yet marked today`}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Missing:</span>
              <span className="font-bold">{missingCount}</span>
            </div>
          )}

          {/* Language selector */}
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as any })}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              <option value="en">English (LTR)</option>
              <option value="ar">العربية (RTL)</option>
              <option value="ur">اردو (RTL)</option>
              <option value="hi">हिन्दी (LTR)</option>
            </select>
          </div>

          {/* Currency indicator button */}
          <div className="hidden sm:block text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {settings.currency}
          </div>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};

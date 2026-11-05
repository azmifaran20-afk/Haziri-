import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  Banknote,
  Timer,
  Receipt,
  CreditCard,
  FileBarChart,
  Briefcase,
  Settings,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'attendance'
  | 'calendar'
  | 'workers'
  | 'payroll'
  | 'overtime'
  | 'expenses'
  | 'advances'
  | 'reports'
  | 'projects'
  | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { mode } = useApp();

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      companyOnly: false,
    },
    {
      id: 'attendance' as NavTab,
      label: 'Attendance',
      icon: Clock,
      companyOnly: false,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: Calendar,
      companyOnly: false,
    },
    {
      id: 'workers' as NavTab,
      label: 'Workers',
      icon: Users,
      companyOnly: true, // Only in Company Mode
    },
    {
      id: 'payroll' as NavTab,
      label: 'Salary & Payroll',
      icon: Banknote,
      companyOnly: false,
    },
    {
      id: 'overtime' as NavTab,
      label: 'Overtime',
      icon: Timer,
      companyOnly: false,
    },
    {
      id: 'expenses' as NavTab,
      label: 'Expenses',
      icon: Receipt,
      companyOnly: false,
    },
    {
      id: 'advances' as NavTab,
      label: 'Advances & Payments',
      icon: CreditCard,
      companyOnly: false,
    },
    {
      id: 'reports' as NavTab,
      label: 'Reports',
      icon: FileBarChart,
      companyOnly: false,
    },
    {
      id: 'projects' as NavTab,
      label: 'Projects',
      icon: Briefcase,
      companyOnly: true, // Only in Company Mode
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      companyOnly: false,
    },
  ];

  const visibleItems = navItems.filter((item) => (mode === 'individual' ? !item.companyOnly : true));

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-50 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 p-4 shrink-0 transition-colors">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-3 mb-2">
          {mode === 'individual' ? 'Personal Navigation' : 'Workforce Console'}
        </div>
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 px-3">
          <div className="flex items-center justify-between">
            <span>Mode:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
              {mode}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Formulas:</span>
            <span className="font-semibold text-emerald-600">Net Auto</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col z-10">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-base">
                WorkLedger Menu
              </span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1.5 overflow-y-auto flex-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('attendance')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === 'attendance' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => onSelectTab('calendar')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === 'calendar' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>

        <button
          onClick={() => onSelectTab('payroll')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === 'payroll' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Payroll</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentTab === 'reports' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileBarChart className="w-4 h-4" />
          <span>Reports</span>
        </button>

        <button
          onClick={onCloseMobile} // toggle drawer
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>More...</span>
        </button>
      </div>
    </>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export const ModeSelectModal: React.FC = () => {
  const { showModeSelectModal, setShowModeSelectModal, setMode, mode } = useApp();

  if (!showModeSelectModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              W
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              WorkLedger <span className="text-emerald-600">Pro</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Choose Your Operating Mode
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Select how you would like to run WorkLedger Pro. You can switch modes anytime without losing data.
          </p>
        </div>

        {/* 2 Large Professional Selection Cards */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. INDIVIDUAL MODE CARD */}
          <div
            onClick={() => setMode('individual')}
            className={`group relative flex flex-col justify-between p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              mode === 'individual'
                ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg dark:hover:border-emerald-600 bg-white dark:bg-slate-800/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  Self-Employed / Contractor
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                INDIVIDUAL MODE
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Designed for self-employed workers, solo contractors, or individuals maintaining a personal register of hours, overtime, personal expenses, and earnings.
              </p>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No company employee category or profession menus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal calendar-based attendance & daily hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hourly, daily or monthly earnings calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Personal expenses & automatic deduction balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Export personal statements to PDF, Excel & CSV</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode('individual')}
              className="w-full py-3 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              Enter Individual Mode
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 2. COMPANY MODE CARD */}
          <div
            onClick={() => setMode('company')}
            className={`group relative flex flex-col justify-between p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              mode === 'company'
                ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg dark:hover:border-emerald-600 bg-white dark:bg-slate-800/60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
                  Enterprises & Contractors
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                COMPANY MODE
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                Designed for construction contractors, subcontractors, facilities and workforce management companies managing multiple workers across projects.
              </p>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full multi-worker management with 12+ profession categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bulk daily attendance & automated overtime calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Expense Minus Karke Final Salary payroll engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Advances & salary payment ledger with zero double-counting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Project-wise labor costing & consolidated payroll reports</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMode('company')}
              className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Enter Company Mode
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>WorkLedger Pro · All data is stored securely in your browser & exportable anytime.</span>
          <button
            onClick={() => setShowModeSelectModal(false)}
            className="hover:underline text-slate-700 dark:text-slate-300 font-medium"
          >
            Continue with last selected
          </button>
        </div>
      </div>
    </div>
  );
};

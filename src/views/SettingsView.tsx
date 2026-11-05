import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { runAutomatedPayrollTests, TestCaseResult } from '../utils/calculations';
import {
  Settings,
  Building,
  DollarSign,
  ShieldCheck,
  History,
  Database,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    mode,
    settings,
    updateSettings,
    professions,
    workers,
    addProfession,
    updateProfession,
    auditLogs,
    currentRole,
    setCurrentRole,
    resetToDemoData,
    clearAllData,
    exportBackupJSON,
    importBackupJSON,
    individualProfile,
    updateIndividualProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'professions' | 'security' | 'audit' | 'backup' | 'tests'>('general');

  // General Form
  const [appName, setAppName] = useState<string>(settings.appName);
  const [companyName, setCompanyName] = useState<string>(settings.companyName);
  const [currency, setCurrency] = useState<string>(settings.currency || 'SAR');
  const [dateFormat, setDateFormat] = useState<any>(settings.dateFormat || 'YYYY-MM-DD');
  const [language, setLanguage] = useState<any>(settings.language || 'en');

  // Profession manager state
  const [newProfName, setNewProfName] = useState<string>('');
  const [newProfCode, setNewProfCode] = useState<string>('');

  // Automated Tests Runner state
  const [testResults, setTestResults] = useState<{
    results: TestCaseResult[];
    totalCount: number;
    passedCount: number;
    failedCount: number;
  } | null>(() => runAutomatedPayrollTests());

  const [testFilter, setTestFilter] = useState<string>('all');

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      appName,
      companyName,
      currency,
      currencySymbol: currency,
      dateFormat,
      language,
    });
    alert('General settings updated successfully!');
  };

  const handleAddProfession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfName.trim()) return;
    addProfession(newProfName.trim(), newProfCode.trim() || undefined);
    setNewProfName('');
    setNewProfCode('');
  };

  const handleExportJSON = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WorkLedger_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackupJSON(content);
        if (ok) {
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleRunTests = () => {
    const out = runAutomatedPayrollTests();
    setTestResults(out);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <span>System Settings & Verification Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure company parameters, currency, roles, audit trails, and run the 32-test automated calculation suite.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'general' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>General Settings</span>
          {activeTab === 'general' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>

        {mode === 'company' && (
          <button
            onClick={() => setActiveTab('professions')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'professions' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Profession Categories ({professions.length})</span>
            {activeTab === 'professions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
        )}

        {mode === 'company' && (
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-3 transition-colors relative ${
              activeTab === 'security' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>User Roles & Permissions</span>
            {activeTab === 'security' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
          </button>
        )}

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'audit' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Audit Trail ({auditLogs.length})</span>
          {activeTab === 'audit' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'tests' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <span>Automated Test Suite</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              32 Tests
            </span>
          </span>
          {activeTab === 'tests' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'backup' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Backup & Persistence</span>
          {activeTab === 'backup' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: GENERAL SETTINGS
         ========================================================================= */}
      {activeTab === 'general' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 text-xs max-w-3xl">
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Application Title
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {mode === 'individual' ? 'Contractor Full Name' : 'Company / Organization Name'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Currency Code
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-bold"
                >
                  <option value="SAR">SAR - Saudi Riyal (Mandatory Default)</option>
                  <option value="AED">AED - UAE Dirham</option>
                  <option value="QAR">QAR - Qatari Riyal</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="INR">INR - Indian Rupee (₹)</option>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Interface Language & Direction
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                >
                  <option value="en">English (LTR)</option>
                  <option value="ar">العربية - Arabic (RTL)</option>
                  <option value="ur">اردو - Urdu (RTL)</option>
                  <option value="hi">हिन्दी - Hindi (LTR)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors shadow-sm"
              >
                Save General Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PROFESSION CATEGORIES (COMPANY MODE ONLY)
         ========================================================================= */}
      {activeTab === 'professions' && mode === 'company' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Profession-Wise Workforce Categories
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Configured default categories from Section 6. You can add, edit, or deactivate categories at any time.
            </p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddProfession} className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="New profession name (e.g. Scaffolder)..."
                value={newProfName}
                onChange={(e) => setNewProfName(e.target.value)}
                required
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
              />
            </div>
            <div className="w-28">
              <input
                type="text"
                placeholder="Code (SCAF)"
                value={newProfCode}
                onChange={(e) => setNewProfCode(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {professions.map((pr, index) => {
              const workerCount = workers.filter((w) => w.professionId === pr.id).length;
              return (
                <div
                  key={pr.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{index + 1}.</span>
                      <span>{pr.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Code: {pr.code || 'CAT'} · {workerCount} Workers
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateProfession(pr.id, { isActive: !pr.isActive })}
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                      pr.isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {pr.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: USER ROLES & PERMISSIONS
         ========================================================================= */}
      {activeTab === 'security' && mode === 'company' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Role-Based Access Control (RBAC)
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Simulate enterprise roles defined in Section 21: Administrator, Attendance Manager, Accountant, Supervisor, and Read-Only Viewer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'admin',
                name: 'Administrator',
                desc: 'Full access to company settings, workers, attendance, payroll and reports.',
              },
              {
                id: 'attendance_manager',
                name: 'Attendance Manager',
                desc: 'Manage worker daily & bulk attendance and assigned workforce schedules.',
              },
              {
                id: 'accountant',
                name: 'Accountant',
                desc: 'Manage expenses, payroll processing, deductions, advances, and payments.',
              },
              {
                id: 'supervisor',
                name: 'Supervisor',
                desc: 'Manage attendance for authorized workers on assigned job sites.',
              },
              {
                id: 'viewer',
                name: 'Read-only User',
                desc: 'View authorized operational information without modifying records.',
              },
            ].map((role) => (
              <div
                key={role.id}
                onClick={() => setCurrentRole(role.id as any)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  currentRole === role.id
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{role.name}</span>
                  {currentRole === role.id && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-xs">{role.desc}</p>
                <div className="mt-3 text-[10px] text-slate-500 font-mono">
                  Active Status: {currentRole === role.id ? 'CURRENT ACTIVE' : 'Switch Role'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: AUDIT TRAIL LOGS
         ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                System Audit Log & Immutable Event Ledger
              </h3>
              <p className="text-slate-500 text-xs">
                Records attendance adjustments, salary rate changes, expense approvals, and payroll finalizations.
              </p>
            </div>
            <span className="font-mono text-xs text-slate-500">{auditLogs.length} Events Logged</span>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User & Role</th>
                  <th className="py-2.5 px-4">Action Event</th>
                  <th className="py-2.5 px-4">Entity Type</th>
                  <th className="py-2.5 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-4 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                      {log.userName} ({log.role})
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap text-emerald-600 font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap uppercase text-slate-500">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: AUTOMATED TEST SUITE RUNNER (ALL 32 TESTS FROM SECTION 25)
         ========================================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl bg-slate-900 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Section 25 Testing Suite
                </span>
                <h3 className="text-xl font-black mt-0.5">
                  Automated Calculation & Engine Verification Suite
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Executes all 32 automated verification requirements including the mandatory calculation test (10 SAR base, 8h regular, 3h OT @ 1.5x = 125 SAR gross) and mandatory final salary test (Gross 2950 − Deductions 500 = Final Payable 2450 − Paid 500 = Remaining 1950 SAR).
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunTests}
                className="py-2.5 px-5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rerun All 32 Tests</span>
              </button>
            </div>

            {/* Test Pass Scorecard */}
            {testResults && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Total Test Requirements</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {testResults.totalCount} Cases
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800">
                  <span className="text-emerald-400">Passed Requirements</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {testResults.passedCount} Passed
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                  <span className="text-slate-400">Failed Requirements</span>
                  <div className="text-2xl font-black text-white mt-1">
                    {testResults.failedCount} Failed
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test cases list table */}
          {testResults && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-4 text-center">#</th>
                      <th className="py-2.5 px-4">Test Case Requirement</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Expected Result</th>
                      <th className="py-2.5 px-4">Actual Output</th>
                      <th className="py-2.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                    {testResults.results.map((t) => (
                      <tr
                        key={t.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-700/30 ${
                          t.id === 5 || t.id === 18 || t.id === 19
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 font-semibold'
                            : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 text-center text-slate-500 font-bold">
                          {t.id}
                        </td>
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                          {t.title}
                          {(t.id === 5 || t.id === 18 || t.id === 19) && (
                            <span className="ml-2 text-[10px] text-emerald-600 uppercase font-black">
                              [MANDATORY SPEC]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-sans">{t.category}</td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                          {t.expected}
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 dark:text-white font-bold">
                          {t.actual}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {t.passed ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 font-sans">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-rose-600 font-sans">
                              <XCircle className="w-3.5 h-3.5" /> FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: BACKUP & PERSISTENCE
         ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-6 text-xs max-w-3xl">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Data Storage, Backup & Restore
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              WorkLedger Pro maintains complete local client storage and allows reliable JSON exports and imports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block">
                Export Full System Backup
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Downloads all workers, projects, attendance logs, expenses, advances, and settings in a single JSON file.
              </p>
              <button
                type="button"
                onClick={handleExportJSON}
                className="py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-slate-900 dark:text-white block">
                Restore From JSON Backup
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                Restore application state and historical records from a previously exported WorkLedger JSON file.
              </p>
              <label className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer inline-flex shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Reset Demo Data
              </span>
              <span className="text-slate-500">
                Reloads verified sample dataset with workers, projects, and test cases.
              </span>
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={resetToDemoData}
                className="py-2 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors"
              >
                Reset Demo Dataset
              </button>
              <button
                type="button"
                onClick={clearAllData}
                className="py-2 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
              >
                Wipe All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

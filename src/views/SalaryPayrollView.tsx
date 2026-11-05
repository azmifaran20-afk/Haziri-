import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PayrollLineItem, PayrollPeriod } from '../types';
import { calculateWorkerPayrollLineItem, formatCurrency } from '../utils/calculations';
import {
  exportWorkerSalarySlipPDF,
  exportConsolidatedPayrollPDF,
  exportToExcel,
  exportToCSV,
} from '../utils/exportUtils';
import {
  Banknote,
  Lock,
  Unlock,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  FileDown,
} from 'lucide-react';

export const SalaryPayrollView: React.FC = () => {
  const {
    mode,
    workers,
    professions,
    projects,
    attendance,
    expenses,
    advances,
    payments,
    payrollPeriods,
    finalizePayroll,
    reopenPayroll,
    settings,
    individualProfile,
    individualAttendance,
    individualExpenses,
    individualAdvances,
    individualPayments,
  } = useApp();

  // Selected period
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('oct-2026');
  const [reopenModalPeriodId, setReopenModalPeriodId] = useState<string | null>(null);
  const [reopenReason, setReopenReason] = useState<string>('');
  const [selectedSlipItem, setSelectedSlipItem] = useState<PayrollLineItem | null>(null);

  const activePeriod = payrollPeriods.find((p) => p.id === selectedPeriodId) || payrollPeriods[0];
  const currency = settings.currency || 'SAR';

  // Compute live payroll line items for the active period
  const calculatedLineItems = useMemo<PayrollLineItem[]>(() => {
    // If Individual Mode: calculate personal line item
    if (mode === 'individual') {
      const personalWorker: any = {
        id: 'individual',
        workerCode: 'IND-01',
        fullName: individualProfile.fullName,
        salarySettings: individualProfile.salarySettings,
        overtimeSettings: individualProfile.overtimeSettings,
      };

      const monthlyAtt = individualAttendance.filter((a) => a.date.startsWith('2026-10'));
      const monthlyExp = individualExpenses.filter((e) => e.date.startsWith('2026-10'));
      const monthlyAdv = individualAdvances;
      const monthlyPay = individualPayments;

      const item = calculateWorkerPayrollLineItem({
        worker: personalWorker,
        attendanceRecords: monthlyAtt,
        approvedExpenses: monthlyExp,
        allocatedAdvances: monthlyAdv,
        allocatedPayments: monthlyPay,
        professionName: individualProfile.tradeOrTitle,
        projectName: 'Personal Contracting',
        scheduledDaysInPeriod: 30,
      });

      return [item];
    }

    // If period is finalized and has saved line items, preserve them exactly!
    if (activePeriod && activePeriod.status === 'finalized' && activePeriod.lineItems?.length > 0) {
      return activePeriod.lineItems;
    }

    // Otherwise compute dynamically from draft records
    const monthlyAtt = attendance.filter((a) => a.date.startsWith('2026-10'));
    const monthlyExp = expenses.filter((e) => e.date.startsWith('2026-10'));

    return workers
      .filter((w) => w.status === 'active')
      .map((w) => {
        const wAtt = monthlyAtt.filter((a) => a.workerId === w.id);
        const wExp = monthlyExp.filter((e) => e.workerId === w.id);
        const wAdv = advances.filter((a) => a.workerId === w.id);
        const wPay = payments.filter((p) => p.workerId === w.id);
        const profName = professions.find((p) => p.id === w.professionId)?.name || 'General';
        const projName = projects.find((p) => p.id === w.assignedProjectId)?.name || 'Main Site';

        return calculateWorkerPayrollLineItem({
          worker: w,
          attendanceRecords: wAtt,
          approvedExpenses: wExp,
          allocatedAdvances: wAdv,
          allocatedPayments: wPay,
          professionName: profName,
          projectName: projName,
          scheduledDaysInPeriod: 30,
        });
      });
  }, [
    mode,
    activePeriod,
    individualProfile,
    individualAttendance,
    individualExpenses,
    individualAdvances,
    individualPayments,
    workers,
    attendance,
    expenses,
    advances,
    payments,
    professions,
    projects,
  ]);

  // Totals
  const totals = useMemo(() => {
    return calculatedLineItems.reduce(
      (acc, item) => ({
        gross: acc.gross + item.grossSalary,
        deductions: acc.deductions + item.totalDeductions,
        payable: acc.payable + item.finalPayableSalary,
        paid: acc.paid + item.salaryAlreadyPaid,
        balance: acc.balance + item.remainingSalaryBalance,
      }),
      { gross: 0, deductions: 0, payable: 0, paid: 0, balance: 0 }
    );
  }, [calculatedLineItems]);

  // Export Handlers
  const handleExportConsolidatedPDF = () => {
    exportConsolidatedPayrollPDF(calculatedLineItems, activePeriod?.name || 'October 2026', settings);
  };

  const handleExportExcel = () => {
    const headers = [
      'Worker ID',
      'Worker Name',
      'Profession',
      'Project',
      'Employment Type',
      'Present Days',
      'Absent Days',
      'Half Days',
      'Regular Hours',
      'Overtime Hours',
      `Basic Wages (${currency})`,
      `Overtime Wages (${currency})`,
      `Gross Salary (${currency})`,
      `Food Deduction (${currency})`,
      `Transport Deduction (${currency})`,
      `Other Deductions (${currency})`,
      `Advance Recovery (${currency})`,
      `Total Deductions (${currency})`,
      `Final Payable Salary (${currency})`,
      `Salary Paid (${currency})`,
      `Remaining Balance (${currency})`,
    ];

    const rows = calculatedLineItems.map((item) => [
      item.workerCode,
      item.workerName,
      item.professionName,
      item.projectName,
      item.employmentType,
      item.presentDays,
      item.absentDays,
      item.halfDays,
      item.regularHours,
      item.overtimeHours,
      item.basicWages,
      item.overtimeWages,
      item.grossSalary,
      item.foodDeduction,
      item.transportDeduction,
      item.otherExpenseDeductions,
      item.advanceRecovery,
      item.totalDeductions,
      item.finalPayableSalary,
      item.salaryAlreadyPaid,
      item.remainingSalaryBalance,
    ]);

    // Totals row
    rows.push([
      'TOTALS',
      `${calculatedLineItems.length} Workers`,
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      totals.gross,
      '',
      '',
      '',
      '',
      totals.deductions,
      totals.payable,
      totals.paid,
      totals.balance,
    ]);

    exportToExcel(`Payroll_${activePeriod?.name || 'October_2026'}`, 'Payroll', headers, rows);
  };

  const handleExportCSV = () => {
    const headers = [
      'Worker Code',
      'Name',
      'Profession',
      'Gross Salary',
      'Total Deductions',
      'Final Payable Salary',
      'Salary Paid',
      'Remaining Balance',
    ];

    const rows = calculatedLineItems.map((item) => [
      item.workerCode,
      item.workerName,
      item.professionName,
      item.grossSalary,
      item.totalDeductions,
      item.finalPayableSalary,
      item.salaryAlreadyPaid,
      item.remainingSalaryBalance,
    ]);

    exportToCSV(`Payroll_${activePeriod?.name || 'October_2026'}`, headers, rows);
  };

  const handleFinalize = () => {
    if (!activePeriod) return;
    finalizePayroll(activePeriod.id, calculatedLineItems);
  };

  const handleReopen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenModalPeriodId || !reopenReason) return;
    reopenPayroll(reopenModalPeriodId, reopenReason);
    setReopenModalPeriodId(null);
    setReopenReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-600" />
            <span>Salary & Payroll Engine</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            "Expense Minus Karke Final Salary" — Guaranteed mathematical accuracy with four-formula architecture.
          </p>
        </div>

        {/* Export and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportConsolidatedPDF}
            className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Register</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel XLSX</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {mode === 'company' && (
            activePeriod?.status === 'finalized' ? (
              <button
                type="button"
                onClick={() => setReopenModalPeriodId(activePeriod.id)}
                className="py-2 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reopen Payroll</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalize}
                className="py-2 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock & Finalize Period</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Mandatory Formulas Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
          <span>Standard Payroll Calculation Architecture</span>
          <span className="font-mono text-[11px] text-slate-400">
            Period: {activePeriod?.name || 'October 2026'} ({activePeriod?.status?.toUpperCase() || 'DRAFT'})
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1 font-mono">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-emerald-400 font-bold block text-[11px]">FORMULA 1: GROSS</span>
            <span className="text-slate-300 text-[11px]">Basic + Overtime + Allowances</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-rose-400 font-bold block text-[11px]">FORMULA 2: DEDUCTIONS</span>
            <span className="text-slate-300 text-[11px]">Approved Expenses + Advance Recovery</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-blue-400 font-bold block text-[11px]">FORMULA 3: FINAL PAYABLE</span>
            <span className="text-slate-300 text-[11px]">Gross Salary − Total Deductions</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-purple-400 font-bold block text-[11px]">FORMULA 4: REMAINING</span>
            <span className="text-slate-300 text-[11px]">Final Payable − Salary Already Paid</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Gross Earnings (F1)</div>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totals.gross, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Basic + Overtime</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Approved Deductions (F2)</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            -{formatCurrency(totals.deductions, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Food + Transit + Advances</div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 shadow-sm">
          <div className="text-xs text-blue-800 dark:text-blue-300 font-medium">Final Payable (F3)</div>
          <div className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {formatCurrency(totals.payable, currency)}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Net Authorized Payroll</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Already Paid</div>
          <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {formatCurrency(totals.paid, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Disbursed Tranches</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border-2 border-emerald-500/50 shadow-sm">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Remaining Balance (F4)</div>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {formatCurrency(totals.balance, currency)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Outstanding Liability</div>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Worker ID</th>
                <th className="py-3 px-3">Full Name</th>
                {mode === 'company' && <th className="py-3 px-3">Profession</th>}
                <th className="py-3 px-3 text-right">Reg / OT Hours</th>
                <th className="py-3 px-3 text-right">Basic Wages</th>
                <th className="py-3 px-3 text-right">Overtime Wages</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                  Gross (F1)
                </th>
                <th className="py-3 px-3 text-right text-rose-600 dark:text-rose-400">
                  Total Deductions (F2)
                </th>
                <th className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                  Final Payable (F3)
                </th>
                <th className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">Paid</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Remaining (F4)
                </th>
                <th className="py-3 px-3 text-center">Pay Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {calculatedLineItems.map((item) => (
                <tr
                  key={item.workerId}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-slate-500">{item.workerCode}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {item.workerName}
                  </td>
                  {mode === 'company' && (
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                      {item.professionName}
                    </td>
                  )}
                  <td className="py-3 px-3 text-right font-mono">
                    {item.regularHours.toFixed(1)}h / <span className="text-amber-600">+{item.overtimeHours.toFixed(1)}h</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {formatCurrency(item.basicWages, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                    +{formatCurrency(item.overtimeWages, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.grossSalary, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{formatCurrency(item.totalDeductions, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(item.finalPayableSalary, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {formatCurrency(item.salaryAlreadyPaid, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(item.remainingSalaryBalance, currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedSlipItem(item)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-[11px] transition-colors"
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td colSpan={mode === 'company' ? 3 : 2} className="py-3 px-3 text-slate-900 dark:text-white">
                  TOTALS ({calculatedLineItems.length} Workers):
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">--</td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">--</td>
                <td className="py-3 px-3 text-right font-mono text-slate-500">--</td>
                <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                  {formatCurrency(totals.gross, currency)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                  -{formatCurrency(totals.deductions, currency)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                  {formatCurrency(totals.payable, currency)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                  {formatCurrency(totals.paid, currency)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totals.balance, currency)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================================
          INDIVIDUAL SALARY STATEMENT (PAY SLIP) MODAL
         ========================================================================= */}
      {selectedSlipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Slip Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Official Salary Statement
                </span>
                <h3 className="font-bold text-base">{selectedSlipItem.workerName}</h3>
                <p className="text-xs text-slate-300">
                  ID: {selectedSlipItem.workerCode} · Period: {activePeriod?.name || 'October 2026'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlipItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Body */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Earnings Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                  <span>1. GROSS EARNINGS</span>
                  <span className="text-slate-500 font-normal">Formula 1</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Basic Wages ({selectedSlipItem.regularHours} Regular Hours):</span>
                  <span className="font-mono">{formatCurrency(selectedSlipItem.basicWages, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Overtime Pay ({selectedSlipItem.overtimeHours} OT Hours):</span>
                  <span className="font-mono text-amber-600 font-semibold">
                    +{formatCurrency(selectedSlipItem.overtimeWages, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Allowances & Subsidies:</span>
                  <span className="font-mono">+{formatCurrency(selectedSlipItem.allowances, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>TOTAL GROSS SALARY:</span>
                  <span className="font-mono text-emerald-600">
                    {formatCurrency(selectedSlipItem.grossSalary, currency)}
                  </span>
                </div>
              </div>

              {/* Deductions Breakdown */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-2">
                <div className="font-bold text-rose-900 dark:text-rose-200 pb-1 border-b border-rose-200 dark:border-rose-800/60 flex justify-between">
                  <span>2. APPROVED SALARY DEDUCTIONS & ADVANCES</span>
                  <span className="text-rose-700 dark:text-rose-400 font-normal">Formula 2</span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Food Expense Deduction (Approved):</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.foodDeduction, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Transport Deduction (Approved):</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.transportDeduction, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Accommodation Deduction (Approved):</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.accommodationDeduction, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Other Authorized Expense Deductions:</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.otherExpenseDeductions, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300">
                  <span>Advance Salary Recovery Scheduled:</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.advanceRecovery, currency)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-rose-900 dark:text-rose-200 pt-1 border-t border-rose-200 dark:border-rose-800/60">
                  <span>TOTAL APPROVED DEDUCTIONS:</span>
                  <span className="font-mono text-rose-600">
                    -{formatCurrency(selectedSlipItem.totalDeductions, currency)}
                  </span>
                </div>
              </div>

              {/* Final Payable & Remaining Balance */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  <span>FINAL PAYABLE SALARY (F3):</span>
                  <span className="font-mono text-base text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(selectedSlipItem.finalPayableSalary, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                  <span>Less: Salary Already Paid / Transferred:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    -{formatCurrency(selectedSlipItem.salaryAlreadyPaid, currency)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-slate-900 dark:text-white pt-1 border-t border-emerald-300 dark:border-emerald-700">
                  <span>REMAINING SALARY BALANCE (F4):</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedSlipItem.remainingSalaryBalance, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    exportWorkerSalarySlipPDF(
                      selectedSlipItem,
                      activePeriod?.name || 'October 2026',
                      settings,
                      mode === 'individual'
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Salary Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {reopenModalPeriodId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Reopen Finalized Payroll
            </h3>
            <p className="text-xs text-slate-500">
              Reopening an audit-locked payroll requires entering an authorized justification that will be recorded permanently in the system audit trail.
            </p>
            <form onSubmit={handleReopen} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Justification / Reason *
                </label>
                <textarea
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  required
                  placeholder="e.g. Correcting missing overtime hours approved late by supervisor Eng. Khalid"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReopenModalPeriodId(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Confirm & Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

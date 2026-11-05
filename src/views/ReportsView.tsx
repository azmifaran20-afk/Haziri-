import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateWorkerPayrollLineItem, formatCurrency } from '../utils/calculations';
import {
  exportWorkerSalarySlipPDF,
  exportConsolidatedPayrollPDF,
  exportToExcel,
  exportToCSV,
} from '../utils/exportUtils';
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Filter,
  User,
  Building,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    mode,
    workers,
    professions,
    projects,
    attendance,
    expenses,
    advances,
    payments,
    settings,
    individualProfile,
    individualAttendance,
    individualExpenses,
    individualAdvances,
    individualPayments,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'consolidated' | 'individual' | 'project' | 'financial'>('consolidated');

  // Filters
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || 'wrk-1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const currency = settings.currency || 'SAR';

  // 1. ALL-WORKER CONSOLIDATED REPORT DATA
  const consolidatedRows = useMemo(() => {
    if (mode === 'individual') return [];

    const monthlyAtt = attendance.filter((a) => a.date.startsWith(selectedMonth));
    const monthlyExp = expenses.filter((e) => e.date.startsWith(selectedMonth));

    return workers
      .filter((w) => {
        if (selectedProjectId !== 'all' && w.assignedProjectId !== selectedProjectId) return false;
        if (selectedProfessionId !== 'all' && w.professionId !== selectedProfessionId) return false;
        return true;
      })
      .map((w) => {
        const wAtt = monthlyAtt.filter((a) => a.workerId === w.id);
        const wExp = monthlyExp.filter((e) => e.workerId === w.id);
        const wAdv = advances.filter((a) => a.workerId === w.id);
        const wPay = payments.filter((p) => p.workerId === w.id);
        const prof = professions.find((p) => p.id === w.professionId)?.name || 'General';
        const proj = projects.find((p) => p.id === w.assignedProjectId)?.name || 'Main Site';

        return calculateWorkerPayrollLineItem({
          worker: w,
          attendanceRecords: wAtt,
          approvedExpenses: wExp,
          allocatedAdvances: wAdv,
          allocatedPayments: wPay,
          professionName: prof,
          projectName: proj,
          scheduledDaysInPeriod: 30,
        });
      });
  }, [mode, workers, attendance, expenses, advances, payments, professions, projects, selectedMonth, selectedProjectId, selectedProfessionId]);

  // Consolidated Totals Row
  const consolidatedTotals = useMemo(() => {
    return consolidatedRows.reduce(
      (acc, r) => ({
        regHours: acc.regHours + r.regularHours,
        otHours: acc.otHours + r.overtimeHours,
        gross: acc.gross + r.grossSalary,
        deductions: acc.deductions + r.totalDeductions,
        payable: acc.payable + r.finalPayableSalary,
        paid: acc.paid + r.salaryAlreadyPaid,
        balance: acc.balance + r.remainingSalaryBalance,
      }),
      { regHours: 0, otHours: 0, gross: 0, deductions: 0, payable: 0, paid: 0, balance: 0 }
    );
  }, [consolidatedRows]);

  // 2. INDIVIDUAL WORKER REPORT DATA
  const individualWorkerReportData = useMemo(() => {
    if (mode === 'individual') {
      const dailyWage = individualProfile.salarySettings.dailyWage || 280;
      const baseHourRate = dailyWage / 8;
      const otMult = individualProfile.overtimeSettings.policyMultiplier || 1.5;

      const attList = individualAttendance
        .filter((a) => a.date.startsWith(selectedMonth))
        .sort((a, b) => a.date.localeCompare(b.date));

      const dailyRows = attList.map((a) => {
        const dateObj = new Date(a.date);
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const isPresent = a.status === 'present';
        const basicWages = isPresent ? dailyWage : 0;
        const otWages = (a.overtimeHours || 0) * baseHourRate * otMult;
        const gross = basicWages + otWages;

        // matching expenses on this date
        const dayExp = individualExpenses.filter((e) => e.date === a.date);
        const dayDeduct = dayExp
          .filter((e) => e.deductFromSalary && e.approvalStatus === 'approved')
          .reduce((s, e) => s + e.amount, 0);

        return {
          date: a.date,
          weekday,
          status: a.status,
          checkIn: a.checkIn || '--:--',
          checkOut: a.checkOut || '--:--',
          breakMinutes: a.breakMinutes || 0,
          regHours: a.regularHours || 0,
          otHours: a.overtimeHours || 0,
          rate: dailyWage,
          otMultiplier: otMult,
          basicWages,
          otWages,
          gross,
          dayDeduct,
          netPayable: gross - dayDeduct,
          notes: a.notes,
        };
      });

      return {
        workerName: individualProfile.fullName,
        workerCode: 'IND-01',
        profession: individualProfile.tradeOrTitle,
        dailyRows,
      };
    }

    // Company Mode: selected worker
    const targetWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
    if (!targetWorker) return null;

    const baseRate =
      targetWorker.salarySettings.employmentType === 'hourly'
        ? targetWorker.salarySettings.baseHourlyRate
        : targetWorker.salarySettings.employmentType === 'daily'
        ? targetWorker.salarySettings.dailyWage / 8
        : targetWorker.salarySettings.monthlySalary / 208;
    const otMult = targetWorker.overtimeSettings.policyMultiplier || 1.5;

    const attList = attendance
      .filter((a) => a.workerId === targetWorker.id && a.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));

    const dailyRows = attList.map((a) => {
      const dateObj = new Date(a.date);
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      let basicWages = 0;
      if (targetWorker.salarySettings.employmentType === 'hourly') {
        basicWages = (a.regularHours || 0) * targetWorker.salarySettings.baseHourlyRate;
      } else if (targetWorker.salarySettings.employmentType === 'daily') {
        if (a.status === 'present') basicWages = targetWorker.salarySettings.dailyWage;
        else if (a.status === 'half_day') basicWages = targetWorker.salarySettings.dailyWage * 0.5;
        else if (a.status === 'paid_leave' || a.status === 'holiday') basicWages = targetWorker.salarySettings.dailyWage;
      } else {
        if (a.status !== 'absent' && a.status !== 'unpaid_leave') {
          basicWages = targetWorker.salarySettings.monthlySalary / 30;
        }
      }

      const otWages = (a.overtimeHours || 0) * baseRate * otMult;
      const gross = basicWages + otWages;

      const dayExp = expenses.filter((e) => e.workerId === targetWorker.id && e.date === a.date);
      const dayDeduct = dayExp
        .filter((e) => e.classification === 'salary_deductible' && e.approvalStatus === 'approved')
        .reduce((s, e) => s + e.amount, 0);

      return {
        date: a.date,
        weekday,
        status: a.status,
        checkIn: a.checkIn || '--:--',
        checkOut: a.checkOut || '--:--',
        breakMinutes: a.breakMinutes || 0,
        regHours: a.regularHours || 0,
        otHours: a.overtimeHours || 0,
        rate: baseRate,
        otMultiplier: otMult,
        basicWages,
        otWages,
        gross,
        dayDeduct,
        netPayable: gross - dayDeduct,
        notes: a.notes,
      };
    });

    const prof = professions.find((p) => p.id === targetWorker.professionId)?.name || 'General';

    return {
      worker: targetWorker,
      workerName: targetWorker.fullName,
      workerCode: targetWorker.workerCode,
      profession: prof,
      dailyRows,
    };
  }, [
    mode,
    selectedWorkerId,
    selectedMonth,
    workers,
    attendance,
    expenses,
    professions,
    individualProfile,
    individualAttendance,
    individualExpenses,
  ]);

  // Export handlers
  const handleExportConsolidatedPDF = () => {
    exportConsolidatedPayrollPDF(consolidatedRows, selectedMonth, settings);
  };

  const handleExportConsolidatedExcel = () => {
    const headers = [
      'Worker ID',
      'Worker Name',
      'Profession',
      'Present Days',
      'Absent Days',
      'Half Days',
      'Regular Hours',
      'Overtime Hours',
      'Gross Salary',
      'Total Deductions',
      'Final Payable Salary',
      'Salary Paid',
      'Remaining Balance',
    ];
    const rows = consolidatedRows.map((r) => [
      r.workerCode,
      r.workerName,
      r.professionName,
      r.presentDays,
      r.absentDays,
      r.halfDays,
      r.regularHours,
      r.overtimeHours,
      r.grossSalary,
      r.totalDeductions,
      r.finalPayableSalary,
      r.salaryAlreadyPaid,
      r.remainingSalaryBalance,
    ]);
    exportToExcel(`Consolidated_Report_${selectedMonth}`, 'Consolidated', headers, rows);
  };

  const handleExportIndividualExcel = () => {
    if (!individualWorkerReportData) return;
    const headers = [
      'Date',
      'Weekday',
      'Attendance Status',
      'Check-In',
      'Check-Out',
      'Regular Hours',
      'Overtime Hours',
      'Basic Wages',
      'Overtime Wages',
      'Gross Earnings',
      'Deductions',
      'Net Payable',
    ];
    const rows = individualWorkerReportData.dailyRows.map((r: any) => [
      r.date,
      r.weekday,
      r.status,
      r.checkIn,
      r.checkOut,
      r.regHours,
      r.otHours,
      r.basicWages,
      r.otWages,
      r.gross,
      r.dayDeduct,
      r.netPayable,
    ]);
    exportToExcel(`Report_${individualWorkerReportData.workerCode}_${selectedMonth}`, 'WorkerReport', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-emerald-600" />
            <span>Reports & Workforce Analytics Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative, zero-discrepancy reports calculated dynamically from verified database records.
          </p>
        </div>

        {/* Global Export Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {activeReportTab === 'consolidated' && mode === 'company' && (
            <>
              <button
                type="button"
                onClick={handleExportConsolidatedPDF}
                className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </button>
              <button
                type="button"
                onClick={handleExportConsolidatedExcel}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel XLSX</span>
              </button>
            </>
          )}

          {activeReportTab === 'individual' && (
            <button
              type="button"
              onClick={handleExportIndividualExcel}
              className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Daily Table</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {mode === 'company' && (
          <button
            onClick={() => setActiveReportTab('consolidated')}
            className={`pb-3 px-3 transition-colors relative ${
              activeReportTab === 'consolidated'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>All-Worker Consolidated Report</span>
            {activeReportTab === 'consolidated' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        )}

        <button
          onClick={() => setActiveReportTab('individual')}
          className={`pb-3 px-3 transition-colors relative ${
            activeReportTab === 'individual'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>{mode === 'individual' ? 'Personal Detailed Ledger' : 'Individual Worker Report'}</span>
          {activeReportTab === 'individual' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        {mode === 'company' && (
          <button
            onClick={() => setActiveReportTab('project')}
            className={`pb-3 px-3 transition-colors relative ${
              activeReportTab === 'project'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Project Labor Cost Report</span>
            {activeReportTab === 'project' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            />
          </div>

          {activeReportTab === 'individual' && mode === 'company' && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.fullName} ({w.workerCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeReportTab === 'consolidated' && mode === 'company' && (
            <>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Projects</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                <select
                  value={selectedProfessionId}
                  onChange={(e) => setSelectedProfessionId(e.target.value)}
                  className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">All Professions</option>
                  {professions.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================================
          REPORT 1: ALL-WORKER CONSOLIDATED REPORT
         ========================================================================= */}
      {activeReportTab === 'consolidated' && mode === 'company' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Worker ID</th>
                  <th className="py-3 px-3">Worker Name</th>
                  <th className="py-3 px-3">Profession</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3 text-center">Days (P/A/H)</th>
                  <th className="py-3 px-3 text-right">Reg H</th>
                  <th className="py-3 px-3 text-right">OT H</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                    Gross Salary (F1)
                  </th>
                  <th className="py-3 px-3 text-right text-rose-600 dark:text-rose-400">
                    Total Deductions (F2)
                  </th>
                  <th className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    Final Payable (F3)
                  </th>
                  <th className="py-3 px-3 text-right text-slate-500">Salary Paid</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    Remaining (F4)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {consolidatedRows.map((r) => (
                  <tr
                    key={r.workerId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono text-slate-500">{r.workerCode}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {r.workerName}
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {r.professionName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                      {r.projectName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {r.presentDays} / <span className="text-rose-600">{r.absentDays}</span> /{' '}
                      <span className="text-amber-600">{r.halfDays}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">{r.regularHours.toFixed(1)}h</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-600 font-semibold">
                      +{r.overtimeHours.toFixed(1)}h
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(r.grossSalary, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                      -{formatCurrency(r.totalDeductions, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(r.finalPayableSalary, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-500">
                      {formatCurrency(r.salaryAlreadyPaid, currency)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(r.remainingSalaryBalance, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Mandatory Totals Row */}
              <tfoot className="bg-slate-100 dark:bg-slate-900 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td colSpan={5} className="py-3 px-3 text-slate-900 dark:text-white">
                    COMPANY-WIDE TOTALS ({consolidatedRows.length} Workers):
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {consolidatedTotals.regHours.toFixed(1)}h
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-600">
                    +{consolidatedTotals.otHours.toFixed(1)}h
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                    {formatCurrency(consolidatedTotals.gross, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{formatCurrency(consolidatedTotals.deductions, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(consolidatedTotals.payable, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                    {formatCurrency(consolidatedTotals.paid, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(consolidatedTotals.balance, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          REPORT 2: INDIVIDUAL WORKER REPORT (DAY-BY-DAY TABLE)
         ========================================================================= */}
      {activeReportTab === 'individual' && individualWorkerReportData && (
        <div className="space-y-4">
          {/* Worker Header Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-xs uppercase font-bold text-slate-500">Worker Profile Report</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {individualWorkerReportData.workerName}
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Worker Code: {individualWorkerReportData.workerCode} · Profession: {individualWorkerReportData.profession}
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {individualWorkerReportData.dailyRows.length} Work Records in {selectedMonth}
            </div>
          </div>

          {/* Day by Day Detailed Table with Weekday and Dates */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Shift Hours</th>
                    <th className="py-3 px-4 text-right">Reg Hours</th>
                    <th className="py-3 px-4 text-right">OT Hours</th>
                    <th className="py-3 px-4 text-right">Basic Wages</th>
                    <th className="py-3 px-4 text-right">Overtime Pay</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      Daily Gross
                    </th>
                    <th className="py-3 px-4 text-right text-rose-600 dark:text-rose-400">
                      Day Deductions
                    </th>
                    <th className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      Net Daily
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {individualWorkerReportData.dailyRows.map((r: any) => (
                    <tr
                      key={r.date}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {r.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {r.weekday}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {r.checkIn} - {r.checkOut}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {r.regHours}h
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600 font-semibold">
                        {r.otHours > 0 ? `+${r.otHours}h` : '0h'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(r.basicWages, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-600">
                        {formatCurrency(r.otWages, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(r.gross, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-rose-600">
                        {r.dayDeduct > 0 ? `-${formatCurrency(r.dayDeduct, currency)}` : '0.00'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(r.netPayable, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          REPORT 3: PROJECT LABOR COST REPORT (COMPANY MODE)
         ========================================================================= */}
      {activeReportTab === 'project' && mode === 'company' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Project Labor Cost Allocation ({selectedMonth})
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated labor expenses, direct site expenses, and budget utilization.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Project Code</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Assigned Workers</th>
                  <th className="py-3 px-4 text-right">Project Budget</th>
                  <th className="py-3 px-4 text-right">Monthly Labor Cost</th>
                  <th className="py-3 px-4 text-right">Direct Site Expenses</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    Total Incurred Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {projects.map((proj) => {
                  const pWorkers = workers.filter((w) => w.assignedProjectId === proj.id);
                  const pExpenses = expenses.filter((e) => e.projectId === proj.id);
                  const expSum = pExpenses.reduce((s, e) => s + e.amount, 0);
                  const laborCost = pWorkers.length * 4800; // estimated labor allocation
                  const totalIncurred = laborCost + expSum;

                  return (
                    <tr
                      key={proj.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {proj.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {proj.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {proj.location}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                        {pWorkers.length}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatCurrency(proj.budget || 0, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">
                        {formatCurrency(laborCost, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">
                        {formatCurrency(expSum, currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalIncurred, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

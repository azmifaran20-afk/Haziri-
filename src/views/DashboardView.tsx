import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Receipt,
  CreditCard,
  Banknote,
  Calendar as CalendarIcon,
  Filter,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
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
    approveExpense,
  } = useApp();

  // Filters for Company Mode
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-31');

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (w.status !== 'active') return false;
      if (selectedProjectId !== 'all' && w.assignedProjectId !== selectedProjectId) return false;
      if (selectedProfessionId !== 'all' && w.professionId !== selectedProfessionId) return false;
      return true;
    });
  }, [workers, selectedProjectId, selectedProfessionId]);

  const activeWorkerIds = useMemo(() => new Set(filteredWorkers.map((w) => w.id)), [filteredWorkers]);

  // Attendance metrics today
  const todayAttendance = useMemo(() => {
    if (mode === 'individual') {
      return individualAttendance.find((a) => a.date === selectedDate);
    }
    return attendance.filter((a) => a.date === selectedDate && activeWorkerIds.has(a.workerId));
  }, [mode, selectedDate, attendance, individualAttendance, activeWorkerIds]);

  // Calculations for Company Mode Dashboard
  const companyStats = useMemo(() => {
    const totalWorkers = filteredWorkers.length;
    const presentToday = (todayAttendance as any[]).filter((a) => a.status === 'present').length;
    const absentToday = (todayAttendance as any[]).filter((a) => a.status === 'absent').length;
    const halfDayToday = (todayAttendance as any[]).filter((a) => a.status === 'half_day').length;
    const leaveToday = (todayAttendance as any[]).filter(
      (a) => a.status === 'paid_leave' || a.status === 'unpaid_leave' || a.status === 'holiday'
    ).length;
    const markedWorkerIds = new Set((todayAttendance as any[]).map((a) => a.workerId));
    const notMarkedToday = filteredWorkers.filter((w) => !markedWorkerIds.has(w.id)).length;

    // Monthly aggregates (October 2026)
    const monthlyAtt = attendance.filter((a) => activeWorkerIds.has(a.workerId) && a.date.startsWith('2026-10'));
    const totalRegHours = monthlyAtt.reduce((sum, a) => sum + (a.regularHours || 0), 0);
    const totalOtHours = monthlyAtt.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

    // Approximate monthly payroll totals
    let totalBasicWages = 0;
    let totalOtWages = 0;
    filteredWorkers.forEach((w) => {
      const wAtt = monthlyAtt.filter((a) => a.workerId === w.id);
      const wReg = wAtt.reduce((s, a) => s + (a.regularHours || 0), 0);
      const wOt = wAtt.reduce((s, a) => s + (a.overtimeHours || 0), 0);
      const mult = w.overtimeSettings.policyMultiplier || 1.5;

      if (w.salarySettings.employmentType === 'hourly') {
        totalBasicWages += wReg * w.salarySettings.baseHourlyRate;
        totalOtWages += wOt * w.salarySettings.baseHourlyRate * mult;
      } else if (w.salarySettings.employmentType === 'daily') {
        const full = wAtt.filter((a) => a.status === 'present').length;
        const half = wAtt.filter((a) => a.status === 'half_day').length;
        totalBasicWages += (full + half * 0.5) * w.salarySettings.dailyWage;
        totalOtWages += wOt * (w.salarySettings.dailyWage / 8) * mult;
      } else {
        totalBasicWages += w.salarySettings.monthlySalary;
        totalOtWages += wOt * (w.salarySettings.monthlySalary / 208) * mult;
      }
    });

    const totalGrossPayroll = totalBasicWages + totalOtWages;

    // Filtered expenses
    const filteredExpenses = expenses.filter(
      (e) => e.date.startsWith('2026-10') && (!e.workerId || activeWorkerIds.has(e.workerId))
    );
    const totalAllExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
    const totalApprovedDeductions = filteredExpenses
      .filter((e) => e.classification === 'salary_deductible' && e.approvalStatus === 'approved')
      .reduce((s, e) => s + e.amount, 0);

    const filteredAdvances = advances.filter((a) => activeWorkerIds.has(a.workerId));
    const totalAdvancesIssued = filteredAdvances.reduce((s, a) => s + a.amount, 0);
    const totalAdvancesRecovered = filteredAdvances.reduce((s, a) => s + a.recoveredAmount, 0);

    const filteredPayments = payments.filter((p) => activeWorkerIds.has(p.workerId));
    const totalSalaryPaid = filteredPayments.reduce((s, p) => s + p.amountPaid, 0);

    const totalFinalPayable = totalGrossPayroll - (totalApprovedDeductions + totalAdvancesRecovered);
    const totalRemainingLiability = totalFinalPayable - totalSalaryPaid;

    return {
      totalWorkers,
      presentToday,
      absentToday,
      halfDayToday,
      leaveToday,
      notMarkedToday,
      totalRegHours,
      totalOtHours,
      totalBasicWages,
      totalOtWages,
      totalGrossPayroll,
      totalAllExpenses,
      totalApprovedDeductions,
      totalAdvancesIssued,
      totalSalaryPaid,
      totalRemainingLiability,
    };
  }, [filteredWorkers, todayAttendance, attendance, expenses, advances, payments, activeWorkerIds]);

  // Individual Mode Dashboard Metrics
  const indStats = useMemo(() => {
    const todayRec = todayAttendance as any;
    const monthlyAtt = individualAttendance.filter((a) => a.date.startsWith('2026-10'));

    const totalRegHours = monthlyAtt.reduce((sum, a) => sum + (a.regularHours || 0), 0);
    const totalOtHours = monthlyAtt.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

    const dailyRate = individualProfile.salarySettings.dailyWage || 280;
    const baseHourRate = individualProfile.salarySettings.baseHourlyRate || 35;
    const otMult = individualProfile.overtimeSettings.policyMultiplier || 1.5;

    const presentDays = monthlyAtt.filter((a) => a.status === 'present').length;
    const basicEarnings = presentDays * dailyRate;
    const otEarnings = totalOtHours * (dailyRate / 8) * otMult;
    const grossEarnings = basicEarnings + otEarnings;

    const totalExpenses = individualExpenses.reduce((s, e) => s + e.amount, 0);
    const approvedDeductions = individualExpenses
      .filter((e) => e.deductFromSalary && e.approvalStatus === 'approved')
      .reduce((s, e) => s + e.amount, 0);

    const advancesReceived = individualAdvances.reduce((s, a) => s + a.amount, 0);
    const salaryReceived = individualPayments.reduce((s, p) => s + p.amountPaid, 0);

    const finalPayable = grossEarnings - approvedDeductions;
    const remainingBalance = finalPayable - salaryReceived;

    return {
      todayStatus: todayRec?.status || 'not_marked',
      todayHours: todayRec?.totalElapsedHours || 0,
      todayOt: todayRec?.overtimeHours || 0,
      todayEarnings: todayRec?.status === 'present' ? dailyRate + (todayRec?.overtimeHours || 0) * (dailyRate / 8) * otMult : 0,
      totalRegHours,
      totalOtHours,
      basicEarnings,
      otEarnings,
      grossEarnings,
      totalExpenses,
      approvedDeductions,
      advancesReceived,
      salaryReceived,
      finalPayable,
      remainingBalance,
    };
  }, [todayAttendance, individualAttendance, individualProfile, individualExpenses, individualAdvances, individualPayments]);

  const currency = settings.currency || 'SAR';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'individual' ? 'Personal Work Dashboard' : 'Workforce & Payroll Overview'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'individual'
              ? `${individualProfile.fullName} · ${individualProfile.tradeOrTitle}`
              : `Active Month: October 2026 · Real-time attendance, overtime & payroll synchronization`}
          </p>
        </div>

        {/* Filters in Company Mode */}
        {mode === 'company' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
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

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
              <select
                value={selectedProfessionId}
                onChange={(e) => setSelectedProfessionId(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Professions</option>
                {professions
                  .filter((pr) => pr.isActive)
                  .map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          COMPANY DASHBOARD VIEW
         ========================================================================= */}
      {mode === 'company' ? (
        <>
          {/* Missing attendance warning alert banner */}
          {companyStats.notMarkedToday > 0 && (
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-orange-900 dark:text-orange-200">
                    Missing Attendance Notice for {selectedDate}
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {companyStats.notMarkedToday} active worker(s) do not have their attendance status recorded for today. Per policy, unrecorded status is preserved as 'Not Marked'.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-orange-700 dark:text-orange-300 shrink-0">
                Action Required
              </span>
            </div>
          )}

          {/* Today's Attendance Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Active Workers</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {companyStats.totalWorkers}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Roster Total</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Present Today
              </div>
              <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200 mt-1">
                {companyStats.presentToday}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                On Duty ({companyStats.totalWorkers ? Math.round((companyStats.presentToday / companyStats.totalWorkers) * 100) : 0}%)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-sm">
              <div className="text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Absent Today
              </div>
              <div className="text-2xl font-black text-rose-800 dark:text-rose-200 mt-1">
                {companyStats.absentToday}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Unexcused</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm">
              <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Half Day
              </div>
              <div className="text-2xl font-black text-amber-800 dark:text-amber-200 mt-1">
                {companyStats.halfDayToday}
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">0.5 Shift</div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 shadow-sm">
              <div className="text-xs text-purple-700 dark:text-purple-400 font-medium">Leave / Off</div>
              <div className="text-2xl font-black text-purple-800 dark:text-purple-200 mt-1">
                {companyStats.leaveToday}
              </div>
              <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">Approved Leaves</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 shadow-sm">
              <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Not Marked
              </div>
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
                {companyStats.notMarkedToday}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Pending Entry</div>
            </div>
          </div>

          {/* Core Financial & Formula Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Payroll */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Gross Payroll (F1)
                </span>
                <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Banknote className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(companyStats.totalGrossPayroll, currency)}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
                <span>Basic: {formatCurrency(companyStats.totalBasicWages, currency)}</span>
                <span>OT: {formatCurrency(companyStats.totalOtWages, currency)}</span>
              </div>
            </div>

            {/* Card 2: Approved Deductions */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Approved Deductions (F2)
                </span>
                <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <Receipt className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
                -{formatCurrency(companyStats.totalApprovedDeductions, currency)}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
                <span>All Expenses: {formatCurrency(companyStats.totalAllExpenses, currency)}</span>
                <span className="text-emerald-600 font-medium">Strictly Isolated</span>
              </div>
            </div>

            {/* Card 3: Salary Already Paid */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Disbursed Salary
                </span>
                <span className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(companyStats.totalSalaryPaid, currency)}
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 flex justify-between">
                <span>Advances Issued:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(companyStats.totalAdvancesIssued, currency)}
                </span>
              </div>
            </div>

            {/* Card 4: Remaining Salary Liability */}
            <div className="p-5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Remaining Liability (F4)
                </span>
                <span className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
                {formatCurrency(companyStats.totalRemainingLiability, currency)}
              </div>
              <div className="mt-3 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-400 flex justify-between">
                <span>Net Payable Balance</span>
                <span className="font-semibold">Ready for Payroll</span>
              </div>
            </div>
          </div>

          {/* Visual Charts & Labor Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Labor Cost Breakdown Chart */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Project-Wise Labor Cost Allocation
                </h3>
                <span className="text-xs text-slate-500">October 2026</span>
              </div>
              <div className="space-y-4">
                {projects.map((proj) => {
                  const pWorkers = workers.filter((w) => w.assignedProjectId === proj.id);
                  const pCost = pWorkers.length * 4800; // estimated labor allocation
                  const maxCost = 25000;
                  const pct = Math.min(100, Math.round((pCost / maxCost) * 100));

                  return (
                    <div key={proj.id} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                          {proj.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(pCost, currency)} ({pWorkers.length} workers)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Profession-wise workforce chart */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Workforce Distribution by Profession
                </h3>
                <span className="text-xs text-slate-500">12 Categories</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {professions.slice(0, 8).map((prof) => {
                  const count = workers.filter((w) => w.professionId === prof.id).length;
                  return (
                    <div
                      key={prof.id}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {prof.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{prof.code || 'CAT'}</div>
                      </div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Salary Payments & Pending Approvals Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Payments */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Disbursed Payments
                </h3>
                <span className="text-xs text-slate-500">Latest allocations</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {payments.slice(0, 4).map((pay) => {
                  const w = workers.find((item) => item.id === pay.workerId);
                  return (
                    <div key={pay.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {w?.fullName || 'Worker'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {pay.date} · Ref: {pay.referenceNumber || pay.paymentCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(pay.amountPaid, currency)}
                        </span>
                        <div className="text-[10px] text-slate-500">{pay.paymentMethod}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expenses Pending Approval */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Expenses & Deductions Review
                </h3>
                <span className="text-xs text-slate-500">Strict Salary Isolation</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {expenses.slice(0, 4).map((exp) => {
                  const isDeductible = exp.classification === 'salary_deductible';
                  return (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span>{exp.description}</span>
                          {isDeductible ? (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              (Salary Deductible)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 dark:text-slate-300">
                              (Company Expense)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {exp.date} · Category: {exp.category} · Status: {exp.approvalStatus}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(exp.amount, currency)}
                        </div>
                        {exp.approvalStatus === 'pending' && (
                          <button
                            onClick={() => approveExpense(exp.id, true)}
                            className="mt-1 text-[10px] text-emerald-600 hover:underline font-semibold"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           INDIVIDUAL MODE DASHBOARD
           ========================================================================= */
        <>
          {/* Today's Quick Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Today's Status</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 capitalize">
                {indStats.todayStatus.replace('_', ' ')}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">2026-10-31</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Today's Hours</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {indStats.todayHours.toFixed(1)}h
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Net Working Hours</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs text-slate-500 font-medium">Today's Overtime</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {indStats.todayOt.toFixed(1)}h
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                {indStats.todayOt > 0 ? 'Approved OT' : 'No Overtime'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
              <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                Today's Daily Earning
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatCurrency(indStats.todayEarnings, currency)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Calculated Gross</div>
            </div>
          </div>

          {/* Month Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Gross Earnings (October)
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(indStats.grossEarnings, currency)}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Base: {formatCurrency(indStats.basicEarnings, currency)}</span>
                <span>OT: {formatCurrency(indStats.otEarnings, currency)}</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Expenses & Deductions
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
                -{formatCurrency(indStats.approvedDeductions, currency)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Total Expenses Logged: {formatCurrency(indStats.totalExpenses, currency)}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Payments Received
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(indStats.salaryReceived, currency)}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Advances: {formatCurrency(indStats.advancesReceived, currency)}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Remaining Balance Due
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-2">
                {formatCurrency(indStats.remainingBalance, currency)}
              </div>
              <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                Final Payable: {formatCurrency(indStats.finalPayable, currency)}
              </div>
            </div>
          </div>

          {/* Recent Individual Records */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Recent Work Log (October 2026)
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {individualAttendance.slice(0, 5).map((att) => (
                  <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {att.date}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {att.checkIn || '--:--'} to {att.checkOut || '--:--'} · {att.notes || 'Normal shift'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {att.regularHours}h regular
                      </span>
                      {att.overtimeHours > 0 && (
                        <div className="text-amber-600 font-semibold">
                          +{att.overtimeHours}h OT
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Recent Personal Expenses & Client Receipts
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {individualExpenses.map((exp) => (
                  <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {exp.description}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {exp.date} · {exp.category} · {exp.paymentMethod}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(exp.amount, currency)}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {exp.deductFromSalary ? 'Deducted from balance' : 'Reimbursable'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

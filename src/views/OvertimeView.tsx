import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import {
  Timer,
  Sliders,
  CheckCircle2,
  Clock,
  Save,
  HelpCircle,
  Plus,
  Filter,
  Search,
} from 'lucide-react';

export const OvertimeView: React.FC = () => {
  const {
    mode,
    workers,
    attendance,
    individualAttendance,
    individualProfile,
    settings,
    updateSettings,
    updateWorker,
    updateIndividualProfile,
  } = useApp();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('2026-10');

  // Multiplier policy state
  const [defaultMultiplier, setDefaultMultiplier] = useState<number>(settings.defaultOvertimeMultiplier || 1.5);
  const [weekendMultiplier, setWeekendMultiplier] = useState<number>(settings.defaultWeekendMultiplier || 2.0);
  const [holidayMultiplier, setHolidayMultiplier] = useState<number>(settings.defaultHolidayMultiplier || 2.0);
  const [roundToMinutes, setRoundToMinutes] = useState<number>(settings.roundToMinutes || 15);
  const [roundingMethod, setRoundingMethod] = useState<'nearest' | 'floor' | 'ceil'>(
    settings.overtimeRoundingMethod || 'nearest'
  );

  const currency = settings.currency || 'SAR';

  // Save global policy
  const handleSavePolicy = () => {
    updateSettings({
      defaultOvertimeMultiplier: defaultMultiplier,
      defaultWeekendMultiplier: weekendMultiplier,
      defaultHolidayMultiplier: holidayMultiplier,
      roundToMinutes,
      overtimeRoundingMethod: roundingMethod,
    });
    alert('Overtime policies saved successfully!');
  };

  // Overtime audit rows
  const overtimeRecords = useMemo(() => {
    if (mode === 'individual') {
      const dailyRate = individualProfile.salarySettings.dailyWage || 280;
      const baseHourRate = dailyRate / 8;
      const mult = individualProfile.overtimeSettings.policyMultiplier || 1.5;

      return individualAttendance
        .filter((a) => a.date.startsWith(filterMonth) && (a.overtimeHours || 0) > 0)
        .map((a) => ({
          id: a.id,
          workerName: individualProfile.fullName,
          workerCode: 'IND-01',
          date: a.date,
          status: a.status,
          regularHours: a.regularHours,
          overtimeHours: a.overtimeHours,
          baseRate: baseHourRate,
          multiplier: mult,
          overtimePay: a.overtimeHours * baseHourRate * mult,
          notes: a.notes,
        }));
    }

    // Company Mode
    return attendance
      .filter((a) => a.date.startsWith(filterMonth) && (a.overtimeHours || 0) > 0)
      .filter((a) => (selectedWorkerId !== 'all' ? a.workerId === selectedWorkerId : true))
      .map((a) => {
        const w = workers.find((item) => item.id === a.workerId);
        const baseRate =
          w?.salarySettings.employmentType === 'hourly'
            ? w.salarySettings.baseHourlyRate
            : w?.salarySettings.employmentType === 'daily'
            ? (w.salarySettings.dailyWage || 120) / 8
            : (w?.salarySettings.monthlySalary || 2400) / 208;
        const mult = w?.overtimeSettings.policyMultiplier || 1.5;
        const overtimePay = (a.overtimeHours || 0) * baseRate * mult;

        return {
          id: a.id,
          workerName: w?.fullName || 'Worker',
          workerCode: w?.workerCode || 'WRK',
          date: a.date,
          status: a.status,
          regularHours: a.regularHours,
          overtimeHours: a.overtimeHours,
          baseRate,
          multiplier: mult,
          overtimePay,
          notes: a.notes,
        };
      });
  }, [mode, individualAttendance, individualProfile, attendance, filterMonth, selectedWorkerId, workers]);

  // Aggregate OT totals
  const totalOtHours = overtimeRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
  const totalOtWages = overtimeRecords.reduce((sum, r) => sum + r.overtimePay, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Timer className="w-6 h-6 text-emerald-600" />
            <span>Overtime & Shift Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configurable multipliers (1.0x, 1.25x, 1.5x, 1.75x, 2.0x, custom), weekend rest day rules & audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-slate-500">Period:</span>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Overtime Policy Settings Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Standard Overtime Calculation Policies
            </h3>
            <p className="text-xs text-slate-500">
              Formula: Overtime Pay = Approved Overtime Hours × Base Rate × Applicable Multiplier
            </p>
          </div>
          <button
            type="button"
            onClick={handleSavePolicy}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Policies</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Regular Daily Overtime Multiplier
            </label>
            <select
              value={defaultMultiplier}
              onChange={(e) => setDefaultMultiplier(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-emerald-600"
            >
              <option value={1.0}>1.0× (Standard Regular)</option>
              <option value={1.25}>1.25× (Custom Increment)</option>
              <option value={1.5}>1.5× (Standard Overtime - Mandatory Default)</option>
              <option value={1.75}>1.75× (Extended Evening)</option>
              <option value={2.0}>2.0× (Double Time)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Weekly Rest Day Multiplier (e.g. Friday)
            </label>
            <input
              type="number"
              step="0.25"
              value={weekendMultiplier}
              onChange={(e) => setWeekendMultiplier(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Official Holiday Multiplier
            </label>
            <input
              type="number"
              step="0.25"
              value={holidayMultiplier}
              onChange={(e) => setHolidayMultiplier(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Minimum Rounding Increment
            </label>
            <select
              value={roundToMinutes}
              onChange={(e) => setRoundToMinutes(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour Exact</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Approved Overtime Hours</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalOtHours.toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{filterMonth} Total</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Overtime Wages</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalOtWages, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Calculated Labor Cost</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            Overtime Shifts Logged
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {overtimeRecords.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            Valid attendance records
          </div>
        </div>
      </div>

      {/* Overtime Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-xs flex justify-between items-center">
          <span>Approved Overtime Shift Ledger</span>
          <span className="text-slate-500 font-normal">
            Sorted chronologically · Preserves manual authorizations
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4 text-right">Regular Hrs</th>
                <th className="py-3 px-4 text-right">Overtime Hrs</th>
                <th className="py-3 px-4 text-right">Base Hourly Rate</th>
                <th className="py-3 px-4 text-center">Multiplier</th>
                <th className="py-3 px-4 text-right">Overtime Wages</th>
                <th className="py-3 px-4">Authorization Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {overtimeRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No overtime hours recorded for the selected period.
                  </td>
                </tr>
              ) : (
                overtimeRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-slate-900 dark:text-white font-semibold">
                      {r.date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {r.workerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.workerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {r.regularHours}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      +{r.overtimeHours}h
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      {formatCurrency(r.baseRate, currency)}/h
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {r.multiplier}x
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(r.overtimePay, currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {r.notes || 'Standard shift excess approved'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, AttendanceStatus } from '../types';
import { formatCurrency, calculateWorkingHours, splitRegularAndOvertime } from '../utils/calculations';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Filter,
  X,
  FileText,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    mode,
    workers,
    professions,
    projects,
    attendance,
    individualAttendance,
    individualExpenses,
    individualProfile,
    expenses,
    settings,
    addAttendanceRecord,
  } = useApp();

  // Active view
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  // Currently focused month (October 2026 default)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  // Filters
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>('all');

  // Selected date for detail panel modal
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>('2026-10-31');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Quick mark attendance state inside calendar
  const [quickMarkStatus, setQuickMarkStatus] = useState<AttendanceStatus>('present');
  const [quickCheckIn, setQuickCheckIn] = useState<string>('08:00');
  const [quickCheckOut, setQuickCheckOut] = useState<string>('17:00');
  const [quickBreakMinutes, setQuickBreakMinutes] = useState<number>(60);
  const [quickWorkerId, setQuickWorkerId] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');

  const currency = settings.currency || 'SAR';
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Active workers
  const activeWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (w.status !== 'active') return false;
      if (selectedWorkerId !== 'all' && w.id !== selectedWorkerId) return false;
      if (selectedProjectId !== 'all' && w.assignedProjectId !== selectedProjectId) return false;
      if (selectedProfessionId !== 'all' && w.professionId !== selectedProfessionId) return false;
      return true;
    });
  }, [workers, selectedWorkerId, selectedProjectId, selectedProfessionId]);

  // Calendar days grid calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Helper to get stats for a date
  const getDateStats = (dateStr: string) => {
    if (mode === 'individual') {
      const rec = individualAttendance.find((a) => a.date === dateStr);
      return {
        status: rec?.status || 'not_marked',
        hours: rec?.totalElapsedHours || 0,
        ot: rec?.overtimeHours || 0,
        rec,
      };
    }

    const recs = attendance.filter((a) => a.date === dateStr);
    const present = recs.filter((a) => a.status === 'present').length;
    const absent = recs.filter((a) => a.status === 'absent').length;
    const halfDay = recs.filter((a) => a.status === 'half_day').length;
    const onLeave = recs.filter(
      (a) => a.status === 'paid_leave' || a.status === 'unpaid_leave' || a.status === 'holiday'
    ).length;
    const totalMarked = recs.length;
    const totalActive = activeWorkers.length;
    const notMarked = Math.max(0, totalActive - totalMarked);

    return {
      present,
      absent,
      halfDay,
      onLeave,
      notMarked,
      totalMarked,
      totalActive,
    };
  };

  // Get status color chip
  const getStatusDot = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500';
      case 'absent':
        return 'bg-rose-500';
      case 'half_day':
        return 'bg-amber-500';
      case 'paid_leave':
        return 'bg-blue-500';
      case 'unpaid_leave':
        return 'bg-purple-500';
      case 'weekly_off':
        return 'bg-slate-400';
      case 'holiday':
        return 'bg-teal-500';
      case 'not_marked':
      default:
        return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  // Handle click on a date cell
  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setQuickWorkerId(activeWorkers[0]?.id || 'individual');
    setQuickMarkStatus('present');
    setQuickCheckIn('08:00');
    setQuickCheckOut('17:00');
    setQuickBreakMinutes(60);
    setQuickNotes('');
    setShowDetailModal(true);
  };

  // Quick save attendance from calendar detail panel
  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateStr) return;

    const stdHours = settings.defaultStandardDailyHours || 8;
    const isWorking = quickMarkStatus === 'present' || quickMarkStatus === 'half_day';
    const hoursCalc = calculateWorkingHours(quickCheckIn, quickCheckOut, quickBreakMinutes, false);
    const split = splitRegularAndOvertime(hoursCalc.netWorkingHours, stdHours);

    const rec: AttendanceRecord = {
      id: `att-${quickWorkerId}-${selectedDateStr}`,
      workerId: quickWorkerId,
      date: selectedDateStr,
      status: quickMarkStatus,
      checkIn: isWorking ? quickCheckIn : undefined,
      checkOut: isWorking ? quickCheckOut : undefined,
      breakMinutes: quickBreakMinutes,
      totalElapsedHours: isWorking ? hoursCalc.totalElapsedHours : 0,
      regularHours: isWorking ? split.regularHours : (quickMarkStatus === 'paid_leave' ? stdHours : 0),
      overtimeHours: isWorking ? split.overtimeHours : 0,
      notes: quickNotes,
      updatedAt: new Date().toISOString(),
    };

    addAttendanceRecord(rec);
  };

  // Selected date detail calculations
  const selectedDateDetails = useMemo(() => {
    if (!selectedDateStr) return null;

    if (mode === 'individual') {
      const rec = individualAttendance.find((a) => a.date === selectedDateStr);
      const dayExpenses = individualExpenses.filter((e) => e.date === selectedDateStr);
      const dailyWage = individualProfile.salarySettings.dailyWage || 280;
      const earnings = rec?.status === 'present' ? dailyWage + (rec.overtimeHours || 0) * (dailyWage / 8) * 1.5 : 0;

      return {
        mode: 'individual',
        date: selectedDateStr,
        status: rec?.status || 'not_marked',
        record: rec,
        expenses: dayExpenses,
        earnings,
      };
    }

    // Company mode: list all worker records for this date
    const dayRecords = attendance.filter((a) => a.date === selectedDateStr);
    const dayExpenses = expenses.filter((e) => e.date === selectedDateStr);

    const presentWorkers = dayRecords.filter((a) => a.status === 'present');
    const absentWorkers = dayRecords.filter((a) => a.status === 'absent');
    const halfDayWorkers = dayRecords.filter((a) => a.status === 'half_day');
    const leaveWorkers = dayRecords.filter(
      (a) => a.status === 'paid_leave' || a.status === 'unpaid_leave' || a.status === 'holiday'
    );
    const markedIds = new Set(dayRecords.map((a) => a.workerId));
    const notMarkedWorkers = activeWorkers.filter((w) => !markedIds.has(w.id));

    return {
      mode: 'company',
      date: selectedDateStr,
      dayRecords,
      dayExpenses,
      presentCount: presentWorkers.length,
      absentCount: absentWorkers.length,
      halfDayCount: halfDayWorkers.length,
      leaveCount: leaveWorkers.length,
      notMarkedCount: notMarkedWorkers.length,
      totalActive: activeWorkers.length,
      notMarkedWorkers,
    };
  }, [selectedDateStr, mode, individualAttendance, individualExpenses, individualProfile, attendance, expenses, activeWorkers]);

  return (
    <div className="space-y-6">
      {/* Top Bar: Title, View Switcher & Month Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <span>Attendance Calendar</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual month register with mandatory attendance status colors & direct date drill-down.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setCalendarView('month')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              calendarView === 'month'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCalendarView('agenda')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              calendarView === 'agenda'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Agenda View
          </button>
        </div>
      </div>

      {/* Month Navigation & Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Month Picker Arrows */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </div>
        </div>

        {/* Filters in Company Mode */}
        {mode === 'company' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Workers</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
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
          </div>
        )}
      </div>

      {/* Mandatory Color Legend Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4 text-xs font-semibold">
        <span className="text-slate-500 uppercase tracking-wider text-[11px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-emerald-700 dark:text-emerald-400">Present (Green)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-rose-700 dark:text-rose-400">Absent (Red)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-amber-700 dark:text-amber-400">Half Day (Orange)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-blue-700 dark:text-blue-400">Paid Leave (Blue)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-purple-700 dark:text-purple-400">Unpaid Leave (Purple)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-slate-600 dark:text-slate-300">Weekly Off (Grey)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-teal-700 dark:text-teal-400">Holiday (Teal)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-slate-500">Not Marked (Neutral)</span>
        </div>
      </div>

      {/* =========================================================================
          MONTHLY CALENDAR GRID
         ========================================================================= */}
      {calendarView === 'month' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center font-bold text-xs uppercase tracking-wider text-slate-500 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div className="text-rose-600 dark:text-rose-400">Fri (Off)</div>
            <div>Sat</div>
          </div>

          {/* Date cells grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-700/60">
            {calendarDays.map((cell) => {
              const isSelected = selectedDateStr === cell.dateStr;
              const stats: any = getDateStats(cell.dateStr);

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleSelectDate(cell.dateStr)}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 flex flex-col justify-between cursor-pointer transition-colors ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-400'
                      : isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/50 inset-0'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isSelected
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center'
                          : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {/* Individual Status Dot */}
                    {mode === 'individual' && cell.isCurrentMonth && (
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(stats.status)}`} />
                    )}
                  </div>

                  {/* Cell details */}
                  <div className="mt-1 space-y-1">
                    {mode === 'individual' ? (
                      cell.isCurrentMonth && (
                        <div className="text-[10px] space-y-0.5">
                          <div className="font-semibold text-slate-700 dark:text-slate-300 capitalize truncate">
                            {stats.status.replace('_', ' ')}
                          </div>
                          {stats.hours > 0 && (
                            <div className="text-slate-500 font-mono">
                              {stats.hours}h {stats.ot > 0 && <span className="text-amber-600">+{stats.ot}h</span>}
                            </div>
                          )}
                        </div>
                      )
                    ) : (
                      /* Company Mode: Attendance distribution pill */
                      cell.isCurrentMonth && (
                        <div className="text-[10px] space-y-0.5">
                          <div className="flex items-center justify-between text-emerald-600 font-semibold">
                            <span>P: {stats.present}</span>
                            {stats.absent > 0 && <span className="text-rose-600">A: {stats.absent}</span>}
                          </div>
                          <div className="flex items-center justify-between text-slate-500">
                            {stats.halfDay > 0 && <span className="text-amber-600">H: {stats.halfDay}</span>}
                            {stats.notMarked > 0 && (
                              <span className="text-slate-600 dark:text-slate-300 font-mono">NM: {stats.notMarked}</span>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          AGENDA VIEW
         ========================================================================= */}
      {calendarView === 'agenda' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 divide-y divide-slate-100 dark:divide-slate-700/60">
          {calendarDays
            .filter((c) => c.isCurrentMonth)
            .slice(0, 15)
            .map((c) => {
              const stats: any = getDateStats(c.dateStr);
              return (
                <div
                  key={c.dateStr}
                  onClick={() => handleSelectDate(c.dateStr)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 px-3 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {c.dateStr}
                    </div>
                    {mode === 'individual' ? (
                      <span className="text-xs capitalize font-semibold text-slate-700 dark:text-slate-300">
                        Status: {stats.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <div className="text-xs space-x-2">
                        <span className="text-emerald-600 font-semibold">Present: {stats.present}</span>
                        <span className="text-rose-600 font-semibold">Absent: {stats.absent}</span>
                        <span className="text-amber-600">Half: {stats.halfDay}</span>
                        <span className="text-slate-600 dark:text-slate-300">Not Marked: {stats.notMarked}</span>
                      </div>
                    )}
                  </div>
                  <button className="text-xs text-blue-600 hover:underline font-semibold">
                    View Details
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* =========================================================================
          DATE DETAIL MODAL (Opens upon clicking any calendar date)
         ========================================================================= */}
      {showDetailModal && selectedDateDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Date Details: {selectedDateDetails.date}
                </h3>
                <p className="text-xs text-slate-500">
                  Daily attendance status, working hours, and expense records.
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Individual Mode Detail */}
              {selectedDateDetails.mode === 'individual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">Attendance Status</div>
                      <div className="text-sm font-bold capitalize text-slate-900 dark:text-white mt-1">
                        {selectedDateDetails.status ? selectedDateDetails.status.replace('_', ' ') : 'Not Marked'}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">Working Hours</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {selectedDateDetails.record?.regularHours || 0}h Regular
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500">Overtime</div>
                      <div className="text-sm font-bold text-amber-600 mt-1">
                        +{selectedDateDetails.record?.overtimeHours || 0}h OT
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300">Daily Earnings</div>
                      <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                        {formatCurrency(selectedDateDetails.earnings || 0, currency)}
                      </div>
                    </div>
                  </div>

                  {selectedDateDetails.record?.notes && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Notes: </span>
                      {selectedDateDetails.record.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Company Mode Detail */}
              {selectedDateDetails.mode === 'company' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                        Present Workers
                      </div>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                        {selectedDateDetails.presentCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                      <div className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold">
                        Absent Workers
                      </div>
                      <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">
                        {selectedDateDetails.absentCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                        Half Day (0.5)
                      </div>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-1">
                        {selectedDateDetails.halfDayCount}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500 font-semibold">Not Marked</div>
                      <div className="text-xl font-black text-slate-700 dark:text-slate-300 mt-1">
                        {selectedDateDetails.notMarkedCount}
                      </div>
                    </div>
                  </div>

                  {/* Worker Breakdown Table */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
                      Worker Attendance on {selectedDateDetails.date}
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {activeWorkers.map((w) => {
                        const rec = (selectedDateDetails.dayRecords || []).find((r: any) => r.workerId === w.id);
                        return (
                          <div
                            key={w.id}
                            className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {w.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">{w.workerCode}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                                {rec?.status ? rec.status.replace('_', ' ') : 'Not Marked'}
                              </span>
                              {rec && rec.regularHours > 0 && (
                                <div className="text-[11px] text-slate-500">
                                  {rec.regularHours}h reg {rec.overtimeHours > 0 && `+ ${rec.overtimeHours}h OT`}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Log Form Direct from Calendar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Update Attendance for this Date</span>
                </h4>
                <form onSubmit={handleQuickSave} className="space-y-3">
                  {mode === 'company' && (
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Select Worker
                      </label>
                      <select
                        value={quickWorkerId}
                        onChange={(e) => setQuickWorkerId(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      >
                        {activeWorkers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.fullName} ({w.workerCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={quickMarkStatus}
                        onChange={(e) => setQuickMarkStatus(e.target.value as AttendanceStatus)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      >
                        <option value="present">Present (Standard Day)</option>
                        <option value="half_day">Half Day (0.5)</option>
                        <option value="absent">Absent</option>
                        <option value="paid_leave">Paid Leave</option>
                        <option value="weekly_off">Weekly Off</option>
                        <option value="holiday">Holiday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                        Unpaid Break (Minutes)
                      </label>
                      <input
                        type="number"
                        value={quickBreakMinutes}
                        onChange={(e) => setQuickBreakMinutes(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Save Attendance to {selectedDateStr}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

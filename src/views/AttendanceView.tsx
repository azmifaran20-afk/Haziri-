import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AttendanceRecord, AttendanceStatus, WorkerProfile } from '../types';
import { calculateWorkingHours, splitRegularAndOvertime } from '../utils/calculations';
import {
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  Filter,
  Users,
  Search,
  Check,
  X,
  FileCheck,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const {
    mode,
    workers,
    projects,
    professions,
    attendance,
    individualAttendance,
    addAttendanceRecord,
    bulkSaveAttendance,
    settings,
  } = useApp();

  const [filterDate, setFilterDate] = useState<string>('2026-10-31');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterProfession, setFilterProfession] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showSingleModal, setShowSingleModal] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);

  // Single Entry Form State
  const [singleWorkerId, setSingleWorkerId] = useState<string>('');
  const [singleDate, setSingleDate] = useState<string>('2026-10-31');
  const [singleStatus, setSingleStatus] = useState<AttendanceStatus>('present');
  const [singleCheckIn, setSingleCheckIn] = useState<string>('08:00');
  const [singleCheckOut, setSingleCheckOut] = useState<string>('17:00');
  const [singleBreakMinutes, setSingleBreakMinutes] = useState<number>(60);
  const [singleIsOvernight, setSingleIsOvernight] = useState<boolean>(false);
  const [singleProjectId, setSingleProjectId] = useState<string>('');
  const [singleNotes, setSingleNotes] = useState<string>('');

  // Bulk Modal Form State
  const [bulkDate, setBulkDate] = useState<string>('2026-10-31');
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusToApply, setBulkStatusToApply] = useState<AttendanceStatus>('present');
  const [bulkCheckIn, setBulkCheckIn] = useState<string>('08:00');
  const [bulkCheckOut, setBulkCheckOut] = useState<string>('17:00');
  const [bulkBreakMinutes, setBulkBreakMinutes] = useState<number>(60);
  const [bulkNotes, setBulkNotes] = useState<string>('');

  // Active records to display based on mode
  const currentAttendanceList = mode === 'individual' ? individualAttendance : attendance;

  // Active workers
  const activeWorkers = useMemo(() => {
    return workers.filter((w) => w.status === 'active');
  }, [workers]);

  // Filtered workers list for table
  const displayedAttendance = useMemo(() => {
    if (mode === 'individual') {
      return individualAttendance
        .filter((a) => (filterDate ? a.date === filterDate : true))
        .map((a) => ({
          record: a,
          workerName: 'Self (Tariq Mansoor)',
          workerCode: 'IND-01',
          profession: 'Contractor',
          project: 'Personal',
        }));
    }

    // Company mode: list all active workers for the date and match their record (or show Not Marked)
    return activeWorkers
      .filter((w) => {
        if (filterProject !== 'all' && w.assignedProjectId !== filterProject) return false;
        if (filterProfession !== 'all' && w.professionId !== filterProfession) return false;
        if (
          searchQuery &&
          !w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !w.workerCode.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((w) => {
        const rec = attendance.find((a) => a.workerId === w.id && a.date === filterDate);
        const prof = professions.find((p) => p.id === w.professionId)?.name || 'General';
        const proj = projects.find((p) => p.id === (rec?.projectId || w.assignedProjectId))?.name || 'Main Site';
        return {
          worker: w,
          record: rec,
          status: rec?.status || 'not_marked',
          workerName: w.fullName,
          workerCode: w.workerCode,
          profession: prof,
          project: proj,
        };
      })
      .filter((item) => {
        if (filterStatus !== 'all') {
          return item.status === filterStatus;
        }
        return true;
      });
  }, [
    mode,
    individualAttendance,
    activeWorkers,
    attendance,
    filterDate,
    filterProject,
    filterProfession,
    filterStatus,
    searchQuery,
    professions,
    projects,
  ]);

  // Open single modal for worker
  const handleOpenSingle = (workerId?: string, existingRecord?: AttendanceRecord) => {
    const targetId = workerId || (activeWorkers[0]?.id || 'individual');
    setSingleWorkerId(targetId);
    setSingleDate(filterDate);

    if (existingRecord) {
      setSingleStatus(existingRecord.status);
      setSingleCheckIn(existingRecord.checkIn || '08:00');
      setSingleCheckOut(existingRecord.checkOut || '17:00');
      setSingleBreakMinutes(existingRecord.breakMinutes ?? 60);
      setSingleIsOvernight(existingRecord.isOvernight || false);
      setSingleProjectId(existingRecord.projectId || '');
      setSingleNotes(existingRecord.notes || '');
    } else {
      setSingleStatus('present');
      setSingleCheckIn('08:00');
      setSingleCheckOut('17:00');
      setSingleBreakMinutes(60);
      setSingleIsOvernight(false);
      setSingleProjectId('');
      setSingleNotes('');
    }
    setShowSingleModal(true);
  };

  // Save single attendance
  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();

    let totalElapsedHours = 0;
    let netWorkingHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;

    if (singleStatus === 'present' || singleStatus === 'half_day') {
      const hoursCalc = calculateWorkingHours(
        singleCheckIn,
        singleCheckOut,
        singleBreakMinutes,
        singleIsOvernight
      );
      totalElapsedHours = hoursCalc.totalElapsedHours;
      netWorkingHours = hoursCalc.netWorkingHours;

      const stdHours = settings.defaultStandardDailyHours || 8;
      const split = splitRegularAndOvertime(netWorkingHours, stdHours);
      regularHours = split.regularHours;
      overtimeHours = split.overtimeHours;
    } else if (singleStatus === 'paid_leave' || singleStatus === 'holiday') {
      regularHours = settings.defaultStandardDailyHours || 8;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${singleWorkerId}-${singleDate}`,
      workerId: singleWorkerId,
      date: singleDate,
      status: singleStatus,
      checkIn: singleStatus === 'present' || singleStatus === 'half_day' ? singleCheckIn : undefined,
      checkOut: singleStatus === 'present' || singleStatus === 'half_day' ? singleCheckOut : undefined,
      breakMinutes: singleBreakMinutes,
      totalElapsedHours,
      regularHours,
      overtimeHours,
      isOvernight: singleIsOvernight,
      projectId: singleProjectId || undefined,
      notes: singleNotes,
      updatedAt: new Date().toISOString(),
    };

    addAttendanceRecord(newRecord);
    setShowSingleModal(false);
  };

  // Open Bulk Modal
  const handleOpenBulk = () => {
    setBulkDate(filterDate);
    setBulkSelectedIds(new Set(activeWorkers.map((w) => w.id)));
    setShowBulkModal(true);
  };

  // Save Bulk Attendance
  const handleSaveBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedIds.size === 0) return;

    const stdHours = settings.defaultStandardDailyHours || 8;
    const hoursCalc = calculateWorkingHours(bulkCheckIn, bulkCheckOut, bulkBreakMinutes, false);
    const split = splitRegularAndOvertime(hoursCalc.netWorkingHours, stdHours);

    const recordsToSave: AttendanceRecord[] = [];

    bulkSelectedIds.forEach((wId) => {
      const isWorking = bulkStatusToApply === 'present' || bulkStatusToApply === 'half_day';
      const record: AttendanceRecord = {
        id: `att-${wId}-${bulkDate}`,
        workerId: wId,
        date: bulkDate,
        status: bulkStatusToApply,
        checkIn: isWorking ? bulkCheckIn : undefined,
        checkOut: isWorking ? bulkCheckOut : undefined,
        breakMinutes: bulkBreakMinutes,
        totalElapsedHours: isWorking ? hoursCalc.totalElapsedHours : 0,
        regularHours: isWorking ? split.regularHours : (bulkStatusToApply === 'paid_leave' ? stdHours : 0),
        overtimeHours: isWorking ? split.overtimeHours : 0,
        notes: bulkNotes || `Bulk marked as ${bulkStatusToApply.toUpperCase()}`,
        updatedAt: new Date().toISOString(),
      };
      recordsToSave.push(record);
    });

    bulkSaveAttendance(recordsToSave);
    setShowBulkModal(false);
  };

  // Helper for color system defined in prompt
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-rose-700 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Absent
          </span>
        );
      case 'half_day':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-700 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Half Day
          </span>
        );
      case 'paid_leave':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-blue-700 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Paid Leave
          </span>
        );
      case 'unpaid_leave':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-purple-700 dark:text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Unpaid Leave
          </span>
        );
      case 'weekly_off':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Weekly Off
          </span>
        );
      case 'holiday':
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-teal-700 dark:text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Holiday
          </span>
        );
      case 'not_marked':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Marked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'individual' ? 'Personal Attendance Log' : 'Workforce Attendance Register'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automatic net working hours & overtime calculation with mandatory anti-duplicate controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'company' && (
            <button
              type="button"
              onClick={handleOpenBulk}
              className="py-2 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk Mark Attendance</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenSingle()}
            className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{mode === 'individual' ? 'Log Daily Attendance' : 'Mark Single Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present (Green)</option>
              <option value="absent">Absent (Red)</option>
              <option value="half_day">Half Day (Orange)</option>
              <option value="paid_leave">Paid Leave (Blue)</option>
              <option value="unpaid_leave">Unpaid Leave (Purple)</option>
              <option value="weekly_off">Weekly Off (Grey)</option>
              <option value="holiday">Holiday (Teal)</option>
              <option value="not_marked">Not Marked (Neutral)</option>
            </select>
          </div>

          {/* Company-only Filters */}
          {mode === 'company' && (
            <>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
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
                  value={filterProfession}
                  onChange={(e) => setFilterProfession(e.target.value)}
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

        {/* Search */}
        {mode === 'company' && (
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search worker by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-xs"
            />
          </div>
        )}
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Worker</th>
                {mode === 'company' && <th className="py-3 px-4">Profession</th>}
                {mode === 'company' && <th className="py-3 px-4">Project</th>}
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Check-In / Out</th>
                <th className="py-3 px-4">Unpaid Break</th>
                <th className="py-3 px-4 text-right">Regular Hrs</th>
                <th className="py-3 px-4 text-right">Overtime Hrs</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {displayedAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={mode === 'company' ? 10 : 8}
                    className="py-12 text-center text-slate-500"
                  >
                    No attendance records match the selected date and filters.
                  </td>
                </tr>
              ) : (
                displayedAttendance.map((item: any) => {
                  const rec: AttendanceRecord | undefined = item.record;
                  return (
                    <tr
                      key={item.worker?.id || item.record?.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {item.workerName}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.workerCode}</div>
                      </td>

                      {mode === 'company' && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {item.profession}
                        </td>
                      )}

                      {mode === 'company' && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {item.project}
                        </td>
                      )}

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono">
                        {filterDate}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {rec?.checkIn && rec?.checkOut ? (
                          <span>
                            {rec.checkIn} - {rec.checkOut}
                            {rec.isOvernight && (
                              <span className="ml-1 text-[10px] text-amber-600 font-sans font-bold">
                                (Overnight)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">--:--</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {rec?.breakMinutes ? `${rec.breakMinutes}m` : '0m'}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {rec?.regularHours !== undefined ? `${rec.regularHours}h` : '0.0h'}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold">
                        {rec?.overtimeHours ? (
                          <span className="text-amber-600 dark:text-amber-400">
                            +{rec.overtimeHours}h
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">0.0h</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenSingle(item.worker?.id, rec)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                        >
                          {rec ? 'Edit' : 'Mark'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          SINGLE ATTENDANCE MODAL
         ========================================================================= */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {mode === 'individual' ? 'Log Daily Attendance' : 'Mark Worker Attendance'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSingleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="p-6 space-y-4 text-xs">
              {mode === 'company' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Worker *
                  </label>
                  <select
                    value={singleWorkerId}
                    onChange={(e) => setSingleWorkerId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
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
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Work Date *
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Attendance Status *
                  </label>
                  <select
                    value={singleStatus}
                    onChange={(e) => setSingleStatus(e.target.value as AttendanceStatus)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="present">Present (Full Day)</option>
                    <option value="half_day">Half Day (0.5 Day)</option>
                    <option value="absent">Absent (Unexcused)</option>
                    <option value="paid_leave">Paid Leave</option>
                    <option value="unpaid_leave">Unpaid Leave</option>
                    <option value="weekly_off">Weekly Off</option>
                    <option value="holiday">Official Holiday</option>
                  </select>
                </div>
              </div>

              {/* Working Hours Fields (if present or half_day) */}
              {(singleStatus === 'present' || singleStatus === 'half_day') && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Check-in Time
                      </label>
                      <input
                        type="time"
                        value={singleCheckIn}
                        onChange={(e) => setSingleCheckIn(e.target.value)}
                        required
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Check-out Time
                      </label>
                      <input
                        type="time"
                        value={singleCheckOut}
                        onChange={(e) => setSingleCheckOut(e.target.value)}
                        required
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Unpaid Break (Minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="240"
                        value={singleBreakMinutes}
                        onChange={(e) => setSingleBreakMinutes(Number(e.target.value))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={singleIsOvernight}
                          onChange={(e) => setSingleIsOvernight(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">Overnight Shift (Past 24:00)</span>
                      </label>
                    </div>
                  </div>

                  {/* Real-time calculated preview */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-slate-600 dark:text-slate-300 text-[11px]">
                    <span>Standard Schedule: 8.0h</span>
                    <span className="font-bold text-emerald-600">
                      Auto-computes Net Regular & Overtime
                    </span>
                  </div>
                </div>
              )}

              {mode === 'company' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Assigned Project (Optional)
                  </label>
                  <select
                    value={singleProjectId}
                    onChange={(e) => setSingleProjectId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Default Worker Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Notes / Audit Remarks
                </label>
                <textarea
                  rows={2}
                  value={singleNotes}
                  onChange={(e) => setSingleNotes(e.target.value)}
                  placeholder="e.g. Approved overtime by supervisor Eng. Khalid"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                >
                  Save Attendance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BULK ATTENDANCE MODAL (COMPANY MODE)
         ========================================================================= */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Bulk Attendance Entry
                </h3>
                <p className="text-xs text-slate-500">
                  Mark attendance and hours simultaneously for all or selected active workers.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBulk} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Target Date *
                  </label>
                  <input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Attendance Status to Apply *
                  </label>
                  <select
                    value={bulkStatusToApply}
                    onChange={(e) => setBulkStatusToApply(e.target.value as AttendanceStatus)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="present">Present (Standard 8 Hours)</option>
                    <option value="half_day">Half Day (4 Hours)</option>
                    <option value="absent">Absent (Zero Hours)</option>
                    <option value="paid_leave">Company Paid Leave</option>
                    <option value="weekly_off">Weekly Off (Rest Day)</option>
                    <option value="holiday">Official Holiday</option>
                  </select>
                </div>
              </div>

              {/* Working Hours configuration for bulk */}
              {(bulkStatusToApply === 'present' || bulkStatusToApply === 'half_day') && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Check-In
                    </label>
                    <input
                      type="time"
                      value={bulkCheckIn}
                      onChange={(e) => setBulkCheckIn(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Check-Out
                    </label>
                    <input
                      type="time"
                      value={bulkCheckOut}
                      onChange={(e) => setBulkCheckOut(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Break (Mins)
                    </label>
                    <input
                      type="number"
                      value={bulkBreakMinutes}
                      onChange={(e) => setBulkBreakMinutes(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Select Workers List with Select All */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Apply to Active Workers ({bulkSelectedIds.size} of {activeWorkers.length} selected)
                  </span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => setBulkSelectedIds(new Set(activeWorkers.map((w) => w.id)))}
                      className="text-emerald-600 hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => setBulkSelectedIds(new Set())}
                      className="text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 p-1 bg-slate-50 dark:bg-slate-900">
                  {activeWorkers.map((w) => {
                    const isChecked = bulkSelectedIds.has(w.id);
                    return (
                      <label
                        key={w.id}
                        className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newSet = new Set(bulkSelectedIds);
                            if (e.target.checked) {
                              newSet.add(w.id);
                            } else {
                              newSet.delete(w.id);
                            }
                            setBulkSelectedIds(newSet);
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {w.fullName}
                          </span>
                          <span className="text-slate-600 dark:text-slate-300 text-[11px] font-mono">
                            {w.workerCode}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Bulk Operation Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  placeholder="e.g. Daily shift attendance confirmed by site engineer"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSelectedIds.size === 0}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Save Bulk Attendance ({bulkSelectedIds.size})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

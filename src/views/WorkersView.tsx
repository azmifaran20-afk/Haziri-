import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { WorkerProfile, EmploymentType, EmploymentStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Archive,
  Edit2,
  Eye,
  X,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Banknote,
  Timer,
  Clock,
  History,
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const {
    workers,
    professions,
    projects,
    addWorker,
    updateWorker,
    archiveWorker,
    settings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProfession, setFilterProfession] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Modals
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingWorker, setEditingWorker] = useState<WorkerProfile | null>(null);
  const [viewingWorker, setViewingWorker] = useState<WorkerProfile | null>(null);

  // Form State
  const [workerCode, setWorkerCode] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [emergencyContact, setEmergencyContact] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>('2026-01-01');
  const [status, setStatus] = useState<EmploymentStatus>('active');
  const [professionId, setProfessionId] = useState<string>('cat-1');
  const [assignedProjectId, setAssignedProjectId] = useState<string>('proj-1');
  const [supervisor, setSupervisor] = useState<string>('');
  const [workLocation, setWorkLocation] = useState<string>('');
  const [shiftSchedule, setShiftSchedule] = useState<string>('08:00 - 17:00');
  const [defaultBreakMinutes, setDefaultBreakMinutes] = useState<number>(60);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([5]); // Friday
  const [notes, setNotes] = useState<string>('');

  // Salary & Overtime Settings
  const [employmentType, setEmploymentType] = useState<EmploymentType>('hourly');
  const [baseHourlyRate, setBaseHourlyRate] = useState<number>(10);
  const [dailyWage, setDailyWage] = useState<number>(120);
  const [monthlySalary, setMonthlySalary] = useState<number>(2400);
  const [standardDailyHours, setStandardDailyHours] = useState<number>(8);
  const [scheduledMonthlyHours, setScheduledMonthlyHours] = useState<number>(208);
  const [halfDayFraction, setHalfDayFraction] = useState<number>(0.5);
  const [paidLeaveFraction, setPaidLeaveFraction] = useState<number>(1.0);
  const [defaultAllowances, setDefaultAllowances] = useState<number>(0);

  const [policyMultiplier, setPolicyMultiplier] = useState<number>(1.5);
  const [restDayMultiplier, setRestDayMultiplier] = useState<number>(2.0);
  const [holidayMultiplier, setHolidayMultiplier] = useState<number>(2.0);

  const currency = settings.currency || 'SAR';

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      if (filterStatus !== 'all' && w.status !== filterStatus) return false;
      if (filterProfession !== 'all' && w.professionId !== filterProfession) return false;
      if (filterProject !== 'all' && w.assignedProjectId !== filterProject) return false;
      if (
        searchQuery &&
        !w.fullName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !w.workerCode.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [workers, filterStatus, filterProfession, filterProject, searchQuery]);

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setWorkerCode(`WRK-${100 + workers.length + 1}`);
    setFullName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setEmergencyContact('');
    setJoiningDate('2026-10-01');
    setStatus('active');
    setProfessionId(professions[0]?.id || 'cat-1');
    setAssignedProjectId(projects[0]?.id || 'proj-1');
    setSupervisor('Eng. Khalid Al-Otaibi');
    setWorkLocation('Main Site');
    setShiftSchedule('08:00 - 17:00');
    setDefaultBreakMinutes(60);
    setWeeklyOffDays([5]);
    setNotes('');

    setEmploymentType('hourly');
    setBaseHourlyRate(12);
    setDailyWage(120);
    setMonthlySalary(2400);
    setStandardDailyHours(8);
    setScheduledMonthlyHours(208);
    setHalfDayFraction(0.5);
    setPaidLeaveFraction(1.0);
    setDefaultAllowances(0);

    setPolicyMultiplier(1.5);
    setRestDayMultiplier(2.0);
    setHolidayMultiplier(2.0);

    setShowModal(true);
  };

  const handleOpenEdit = (w: WorkerProfile) => {
    setEditingWorker(w);
    setWorkerCode(w.workerCode);
    setFullName(w.fullName);
    setPhone(w.phone || '');
    setEmail(w.email || '');
    setAddress(w.address || '');
    setEmergencyContact(w.emergencyContact || '');
    setJoiningDate(w.joiningDate);
    setStatus(w.status);
    setProfessionId(w.professionId);
    setAssignedProjectId(w.assignedProjectId || '');
    setSupervisor(w.supervisor || '');
    setWorkLocation(w.workLocation || '');
    setShiftSchedule(w.shiftSchedule || '08:00 - 17:00');
    setDefaultBreakMinutes(w.defaultBreakMinutes || 60);
    setWeeklyOffDays(w.weeklyOffDays || [5]);
    setNotes(w.notes || '');

    setEmploymentType(w.salarySettings.employmentType);
    setBaseHourlyRate(w.salarySettings.baseHourlyRate);
    setDailyWage(w.salarySettings.dailyWage);
    setMonthlySalary(w.salarySettings.monthlySalary);
    setStandardDailyHours(w.salarySettings.standardDailyHours);
    setScheduledMonthlyHours(w.salarySettings.scheduledMonthlyHours);
    setHalfDayFraction(w.salarySettings.halfDayFraction);
    setPaidLeaveFraction(w.salarySettings.paidLeaveFraction);
    setDefaultAllowances(w.salarySettings.defaultAllowances || 0);

    setPolicyMultiplier(w.overtimeSettings.policyMultiplier);
    setRestDayMultiplier(w.overtimeSettings.restDayMultiplier);
    setHolidayMultiplier(w.overtimeSettings.holidayMultiplier);

    setShowModal(true);
  };

  const handleSaveWorker = (e: React.FormEvent) => {
    e.preventDefault();

    const workerData: WorkerProfile = {
      id: editingWorker ? editingWorker.id : `wrk-${Date.now()}`,
      workerCode,
      fullName,
      phone,
      email,
      address,
      emergencyContact,
      joiningDate,
      status,
      professionId,
      assignedProjectId: assignedProjectId || undefined,
      supervisor,
      workLocation,
      shiftSchedule,
      defaultBreakMinutes,
      weeklyOffDays,
      salarySettings: {
        employmentType,
        baseHourlyRate,
        dailyWage,
        monthlySalary,
        standardDailyHours,
        scheduledMonthlyHours,
        halfDayFraction,
        paidLeaveFraction,
        unpaidAbsenceDeduction: true,
        defaultAllowances,
        effectiveDate: new Date().toISOString().split('T')[0],
      },
      overtimeSettings: {
        policyMultiplier,
        restDayMultiplier,
        holidayMultiplier,
        nightShiftMultiplier: 1.25,
        minimumIncrementMinutes: 15,
        dailyThresholdHours: standardDailyHours,
        roundingMethod: 'nearest',
      },
      notes,
      createdAt: editingWorker ? editingWorker.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingWorker) {
      updateWorker(workerData);
    } else {
      addWorker(workerData);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Worker Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain worker profiles, 12 profession categories, independent salary rules & rate history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Worker</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Profession filter */}
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

          {/* Project filter */}
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
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by worker name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-xs"
          />
        </div>
      </div>

      {/* Workers Roster Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Worker Code & Name</th>
                <th className="py-3 px-4">Profession</th>
                <th className="py-3 px-4">Assigned Project</th>
                <th className="py-3 px-4">Employment Type</th>
                <th className="py-3 px-4">Salary Base Rate</th>
                <th className="py-3 px-4">OT Multiplier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    No workers found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((w) => {
                  const prof = professions.find((p) => p.id === w.professionId)?.name || 'General';
                  const proj = projects.find((p) => p.id === w.assignedProjectId)?.name || 'Unassigned';

                  return (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {w.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{w.workerCode}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {prof}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {proj}
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                          {w.salarySettings.employmentType}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {w.salarySettings.employmentType === 'hourly' &&
                          `${w.salarySettings.baseHourlyRate} ${currency}/hr`}
                        {w.salarySettings.employmentType === 'daily' &&
                          `${w.salarySettings.dailyWage} ${currency}/day`}
                        {w.salarySettings.employmentType === 'monthly' &&
                          `${w.salarySettings.monthlySalary} ${currency}/mo`}
                      </td>

                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-semibold font-mono">
                        {w.overtimeSettings.policyMultiplier || 1.5}x
                      </td>

                      <td className="py-3 px-4">
                        {w.status === 'active' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        )}
                        {w.status === 'inactive' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Inactive
                          </span>
                        )}
                        {w.status === 'archived' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Archived
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingWorker(w)}
                            title="View Profile Details"
                            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(w)}
                            title="Edit Worker Profile & Salary"
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {w.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => archiveWorker(w.id)}
                              title="Archive Worker (Historical data preserved)"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
          ADD / EDIT WORKER MODAL
         ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingWorker ? `Edit Worker: ${editingWorker.fullName}` : 'Create New Worker Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              {/* Profile Details */}
              <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                1. Personal & Employment Information
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Worker ID / Code *
                  </label>
                  <input
                    type="text"
                    value={workerCode}
                    onChange={(e) => setWorkerCode(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Tariq Al-Mansoor"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Profession Category *
                  </label>
                  <select
                    value={professionId}
                    onChange={(e) => setProfessionId(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    {professions.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Assigned Project
                  </label>
                  <select
                    value={assignedProjectId}
                    onChange={(e) => setAssignedProjectId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="">No Project Assigned</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50..."
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EmploymentStatus)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Salary Settings */}
              <div className="font-bold text-slate-900 dark:text-white pt-2 pb-1 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>2. Salary & Wage Settings</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Historical finalized payroll remains isolated
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Calculation Method *
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-emerald-600"
                  >
                    <option value="hourly">Hourly Wage</option>
                    <option value="daily">Daily Wage</option>
                    <option value="monthly">Monthly Fixed Salary</option>
                  </select>
                </div>

                {employmentType === 'hourly' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Base Hourly Rate ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={baseHourlyRate}
                      onChange={(e) => setBaseHourlyRate(Number(e.target.value))}
                      required
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                    />
                  </div>
                )}

                {employmentType === 'daily' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Daily Wage Rate ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={dailyWage}
                      onChange={(e) => setDailyWage(Number(e.target.value))}
                      required
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                    />
                  </div>
                )}

                {employmentType === 'monthly' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Monthly Salary ({currency}) *
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={monthlySalary}
                      onChange={(e) => setMonthlySalary(Number(e.target.value))}
                      required
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Standard Daily Hours
                  </label>
                  <input
                    type="number"
                    value={standardDailyHours}
                    onChange={(e) => setStandardDailyHours(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Overtime Policies */}
              <div className="font-bold text-slate-900 dark:text-white pt-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                3. Overtime Policy Multipliers
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Regular OT Multiplier
                  </label>
                  <select
                    value={policyMultiplier}
                    onChange={(e) => setPolicyMultiplier(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  >
                    <option value={1.0}>1.0x (Regular Base)</option>
                    <option value={1.25}>1.25x (Custom)</option>
                    <option value={1.5}>1.5x (Standard Overtime)</option>
                    <option value={1.75}>1.75x (Extended)</option>
                    <option value={2.0}>2.0x (Double Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Weekend Rest Day OT
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={restDayMultiplier}
                    onChange={(e) => setRestDayMultiplier(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Holiday OT Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={holidayMultiplier}
                    onChange={(e) => setHolidayMultiplier(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Worker Notes / Skills
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Master high-voltage wiring certificate, site safety pass valid until 2027"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                >
                  {editingWorker ? 'Save Changes' : 'Create Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW WORKER DETAILS MODAL
         ========================================================================= */}
      {viewingWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {viewingWorker.fullName}
                </h3>
                <span className="font-mono text-xs text-slate-500">{viewingWorker.workerCode}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewingWorker(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-500">Profession:</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {professions.find((p) => p.id === viewingWorker.professionId)?.name || 'General'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Project:</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {projects.find((p) => p.id === viewingWorker.assignedProjectId)?.name || 'Main Site'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Shift Schedule:</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {viewingWorker.shiftSchedule || '08:00 - 17:00'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Supervisor:</span>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {viewingWorker.supervisor || 'Site Engineer'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Salary & Overtime Configuration:
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                  <div>
                    <span>Type: </span>
                    <strong className="capitalize">{viewingWorker.salarySettings.employmentType}</strong>
                  </div>
                  <div>
                    <span>Base Rate: </span>
                    <strong>
                      {viewingWorker.salarySettings.employmentType === 'hourly' &&
                        `${viewingWorker.salarySettings.baseHourlyRate} ${currency}/hr`}
                      {viewingWorker.salarySettings.employmentType === 'daily' &&
                        `${viewingWorker.salarySettings.dailyWage} ${currency}/day`}
                      {viewingWorker.salarySettings.employmentType === 'monthly' &&
                        `${viewingWorker.salarySettings.monthlySalary} ${currency}/mo`}
                    </strong>
                  </div>
                  <div>
                    <span>Overtime Rate: </span>
                    <strong>{viewingWorker.overtimeSettings.policyMultiplier || 1.5}x</strong>
                  </div>
                  <div>
                    <span>Weekend OT: </span>
                    <strong>{viewingWorker.overtimeSettings.restDayMultiplier || 2.0}x</strong>
                  </div>
                </div>
              </div>

              {viewingWorker.notes && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <span className="font-bold">Remarks: </span>
                  {viewingWorker.notes}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingWorker(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

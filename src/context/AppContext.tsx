import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppMode,
  UserRole,
  WorkerProfile,
  IndividualProfile,
  ProfessionCategory,
  Project,
  AttendanceRecord,
  ExpenseRecord,
  AdvanceRecord,
  SalaryPayment,
  PayrollPeriod,
  AppSettings,
  AuditLogEntry,
  PayrollLineItem,
} from '../types';
import {
  DEFAULT_PROFESSIONS,
  DEFAULT_PROJECTS,
  DEFAULT_WORKERS,
  DEFAULT_INDIVIDUAL_PROFILE,
  DEFAULT_EXPENSES,
  DEFAULT_INDIVIDUAL_EXPENSES,
  DEFAULT_ADVANCES,
  DEFAULT_INDIVIDUAL_ADVANCES,
  DEFAULT_PAYMENTS,
  DEFAULT_INDIVIDUAL_PAYMENTS,
  DEFAULT_SETTINGS,
  INITIAL_AUDIT_LOGS,
  generateInitialAttendance,
  generateInitialIndividualAttendance,
} from '../utils/initialData';
import { calculateWorkerPayrollLineItem } from '../utils/calculations';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  showModeSelectModal: boolean;
  setShowModeSelectModal: (show: boolean) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Company Mode State
  workers: WorkerProfile[];
  professions: ProfessionCategory[];
  projects: Project[];
  attendance: AttendanceRecord[];
  expenses: ExpenseRecord[];
  advances: AdvanceRecord[];
  payments: SalaryPayment[];
  payrollPeriods: PayrollPeriod[];
  auditLogs: AuditLogEntry[];

  // Individual Mode State
  individualProfile: IndividualProfile;
  individualAttendance: AttendanceRecord[];
  individualExpenses: ExpenseRecord[];
  individualAdvances: AdvanceRecord[];
  individualPayments: SalaryPayment[];
  updateIndividualProfile: (profile: Partial<IndividualProfile>) => void;

  // Actions
  addAttendanceRecord: (record: AttendanceRecord) => boolean;
  bulkSaveAttendance: (records: AttendanceRecord[]) => void;
  addWorker: (worker: WorkerProfile) => void;
  updateWorker: (worker: WorkerProfile) => void;
  archiveWorker: (workerId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  addProfession: (name: string, code?: string) => void;
  updateProfession: (id: string, updates: Partial<ProfessionCategory>) => void;
  addExpense: (expense: ExpenseRecord) => void;
  updateExpense: (expense: ExpenseRecord) => void;
  approveExpense: (expenseId: string, approved: boolean) => void;
  addAdvance: (advance: AdvanceRecord) => void;
  addPayment: (payment: SalaryPayment) => void;
  finalizePayroll: (periodId: string, lineItems: PayrollLineItem[]) => void;
  reopenPayroll: (periodId: string, reason: string) => void;
  addAuditLog: (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => void;
  
  // Storage & Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportBackupJSON: () => string;
  importBackupJSON: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MODE: 'wl_mode',
  THEME: 'wl_theme',
  SETTINGS: 'wl_settings',
  WORKERS: 'wl_workers',
  PROFESSIONS: 'wl_professions',
  PROJECTS: 'wl_projects',
  ATTENDANCE: 'wl_attendance',
  EXPENSES: 'wl_expenses',
  ADVANCES: 'wl_advances',
  PAYMENTS: 'wl_payments',
  PAYROLLS: 'wl_payrolls',
  AUDIT_LOGS: 'wl_audit_logs',
  IND_PROFILE: 'wl_ind_profile',
  IND_ATTENDANCE: 'wl_ind_attendance',
  IND_EXPENSES: 'wl_ind_expenses',
  IND_ADVANCES: 'wl_ind_advances',
  IND_PAYMENTS: 'wl_ind_payments',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode selection & modal
  const [mode, setModeState] = useState<AppMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as AppMode) || 'company';
  });
  const [showModeSelectModal, setShowModeSelectModal] = useState<boolean>(() => {
    return !localStorage.getItem(STORAGE_KEYS.MODE);
  });

  // Theme
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark') || 'light';
  });

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(settings.currentRole || 'admin');

  // Company State
  const [workers, setWorkers] = useState<WorkerProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
    return saved ? JSON.parse(saved) : DEFAULT_WORKERS;
  });

  const [professions, setProfessions] = useState<ProfessionCategory[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFESSIONS);
    return saved ? JSON.parse(saved) : DEFAULT_PROFESSIONS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return saved ? JSON.parse(saved) : generateInitialAttendance();
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [advances, setAdvances] = useState<AdvanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADVANCES);
    return saved ? JSON.parse(saved) : DEFAULT_ADVANCES;
  });

  const [payments, setPayments] = useState<SalaryPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
  });

  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLLS);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'oct-2026',
        name: 'October 2026',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        status: 'draft',
        lineItems: [],
        totalGross: 0,
        totalDeductions: 0,
        totalFinalPayable: 0,
        totalPaid: 0,
        totalRemainingBalance: 0,
        createdAt: '2026-10-01',
        updatedAt: '2026-10-31',
      },
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Individual Mode State
  const [individualProfile, setIndividualProfile] = useState<IndividualProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IND_PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_INDIVIDUAL_PROFILE;
  });

  const [individualAttendance, setIndividualAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IND_ATTENDANCE);
    return saved ? JSON.parse(saved) : generateInitialIndividualAttendance();
  });

  const [individualExpenses, setIndividualExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IND_EXPENSES);
    return saved ? JSON.parse(saved) : DEFAULT_INDIVIDUAL_EXPENSES;
  });

  const [individualAdvances, setIndividualAdvances] = useState<AdvanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IND_ADVANCES);
    return saved ? JSON.parse(saved) : DEFAULT_INDIVIDUAL_ADVANCES;
  });

  const [individualPayments, setIndividualPayments] = useState<SalaryPayment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IND_PAYMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_INDIVIDUAL_PAYMENTS;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    // Check RTL direction
    if (settings.language === 'ar' || settings.language === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFESSIONS, JSON.stringify(professions));
  }, [professions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
  }, [advances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYROLLS, JSON.stringify(payrollPeriods));
  }, [payrollPeriods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IND_PROFILE, JSON.stringify(individualProfile));
  }, [individualProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IND_ATTENDANCE, JSON.stringify(individualAttendance));
  }, [individualAttendance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IND_EXPENSES, JSON.stringify(individualExpenses));
  }, [individualExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IND_ADVANCES, JSON.stringify(individualAdvances));
  }, [individualAdvances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IND_PAYMENTS, JSON.stringify(individualPayments));
  }, [individualPayments]);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    setShowModeSelectModal(false);
    addAuditLog('MODE_SWITCHED', 'settings', 'app-mode', `Switched application mode to ${newMode.toUpperCase()}`);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    addAuditLog('SETTINGS_UPDATED', 'settings', 'general', 'General application settings updated');
  };

  const updateIndividualProfile = (prof: Partial<IndividualProfile>) => {
    setIndividualProfile((prev) => ({ ...prev, ...prof }));
    addAuditLog('INDIVIDUAL_PROFILE_UPDATED', 'worker', 'individual', 'Individual profile updated');
  };

  const addAuditLog = (
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'usr-current',
      userName: currentRole === 'admin' ? 'Administrator' : currentRole.replace('_', ' ').toUpperCase(),
      role: currentRole.toUpperCase(),
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 199)]);
  };

  // Company: Attendance
  const addAttendanceRecord = (record: AttendanceRecord): boolean => {
    if (mode === 'individual') {
      setIndividualAttendance((prev) => {
        const filtered = prev.filter((r) => r.date !== record.date);
        return [record, ...filtered];
      });
      addAuditLog('ATTENDANCE_RECORDED', 'attendance', record.id, `Personal attendance recorded for ${record.date}`);
      return true;
    }

    // Check duplicate
    setAttendance((prev) => {
      const filtered = prev.filter(
        (r) => !(r.workerId === record.workerId && r.date === record.date)
      );
      return [record, ...filtered];
    });

    const wrk = workers.find((w) => w.id === record.workerId);
    addAuditLog(
      'ATTENDANCE_RECORDED',
      'attendance',
      record.id,
      `Attendance updated for ${wrk?.fullName || record.workerId} on ${record.date} (${record.status.toUpperCase()})`
    );
    return true;
  };

  const bulkSaveAttendance = (records: AttendanceRecord[]) => {
    if (mode === 'individual') return;
    setAttendance((prev) => {
      const dateSet = new Set(records.map((r) => `${r.workerId}_${r.date}`));
      const remaining = prev.filter((r) => !dateSet.has(`${r.workerId}_${r.date}`));
      return [...records, ...remaining];
    });
    addAuditLog(
      'BULK_ATTENDANCE_SAVED',
      'attendance',
      'bulk',
      `Bulk attendance updated for ${records.length} workers on ${records[0]?.date || 'date'}`
    );
  };

  // Workers
  const addWorker = (worker: WorkerProfile) => {
    setWorkers((prev) => [worker, ...prev]);
    addAuditLog('WORKER_CREATED', 'worker', worker.id, `New worker added: ${worker.fullName} (${worker.workerCode})`);
  };

  const updateWorker = (updatedWorker: WorkerProfile) => {
    setWorkers((prev) => prev.map((w) => (w.id === updatedWorker.id ? updatedWorker : w)));
    addAuditLog('WORKER_UPDATED', 'worker', updatedWorker.id, `Worker profile updated: ${updatedWorker.fullName}`);
  };

  const archiveWorker = (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, status: 'archived' } : w))
    );
    addAuditLog('WORKER_ARCHIVED', 'worker', workerId, `Worker ID ${workerId} was archived (historical records preserved)`);
  };

  // Projects
  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    addAuditLog('PROJECT_CREATED', 'settings', project.id, `New project created: ${project.name}`);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    addAuditLog('PROJECT_UPDATED', 'settings', updatedProject.id, `Project details updated: ${updatedProject.name}`);
  };

  // Professions
  const addProfession = (name: string, code?: string) => {
    const newProf: ProfessionCategory = {
      id: `cat-${Date.now()}`,
      name,
      code: code || name.substring(0, 4).toUpperCase(),
      isActive: true,
      order: professions.length + 1,
    };
    setProfessions((prev) => [...prev, newProf]);
    addAuditLog('PROFESSION_ADDED', 'settings', newProf.id, `New profession category created: ${name}`);
  };

  const updateProfession = (id: string, updates: Partial<ProfessionCategory>) => {
    setProfessions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    addAuditLog('PROFESSION_UPDATED', 'settings', id, `Profession category ${id} updated`);
  };

  // Expenses
  const addExpense = (expense: ExpenseRecord) => {
    if (mode === 'individual') {
      setIndividualExpenses((prev) => [expense, ...prev]);
      addAuditLog('EXPENSE_RECORDED', 'expense', expense.id, `Personal expense recorded: ${expense.amount} ${expense.currency} (${expense.category})`);
      return;
    }
    setExpenses((prev) => [expense, ...prev]);
    addAuditLog(
      'EXPENSE_RECORDED',
      'expense',
      expense.id,
      `Expense ${expense.expenseCode} entered: ${expense.amount} ${expense.currency} [${expense.classification}]`
    );
  };

  const updateExpense = (expense: ExpenseRecord) => {
    if (mode === 'individual') {
      setIndividualExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
      return;
    }
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
    addAuditLog('EXPENSE_UPDATED', 'expense', expense.id, `Expense ${expense.expenseCode} updated`);
  };

  const approveExpense = (expenseId: string, approved: boolean) => {
    const list = mode === 'individual' ? individualExpenses : expenses;
    const exp = list.find((e) => e.id === expenseId);
    if (!exp) return;

    const newStatus = approved ? 'approved' : 'rejected';
    const updated: ExpenseRecord = {
      ...exp,
      approvalStatus: newStatus,
      approvedBy: currentRole === 'admin' ? 'Administrator' : 'Authorized Manager',
      approvedAt: new Date().toISOString(),
    };

    if (mode === 'individual') {
      setIndividualExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
    } else {
      setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
    }
    addAuditLog(
      'EXPENSE_STATUS_CHANGED',
      'expense',
      expenseId,
      `Expense ${exp.expenseCode} status changed to ${newStatus.toUpperCase()}`
    );
  };

  // Advances
  const addAdvance = (advance: AdvanceRecord) => {
    if (mode === 'individual') {
      setIndividualAdvances((prev) => [advance, ...prev]);
      addAuditLog('ADVANCE_RECORDED', 'advance', advance.id, `Personal advance recorded: ${advance.amount} ${advance.currency}`);
      return;
    }
    setAdvances((prev) => [advance, ...prev]);
    addAuditLog(
      'ADVANCE_ISSUED',
      'advance',
      advance.id,
      `Advance of ${advance.amount} ${advance.currency} issued to worker ${advance.workerId}`
    );
  };

  // Payments
  const addPayment = (payment: SalaryPayment) => {
    if (mode === 'individual') {
      setIndividualPayments((prev) => [payment, ...prev]);
      addAuditLog('PAYMENT_RECORDED', 'payment', payment.id, `Personal payment received: ${payment.amountPaid} ${payment.currency}`);
      return;
    }
    setPayments((prev) => [payment, ...prev]);
    addAuditLog(
      'SALARY_PAYMENT_RECORDED',
      'payment',
      payment.id,
      `Salary payment of ${payment.amountPaid} ${payment.currency} recorded for worker ${payment.workerId}`
    );
  };

  // Payroll Finalization & Locking
  const finalizePayroll = (periodId: string, lineItems: PayrollLineItem[]) => {
    setPayrollPeriods((prev) =>
      prev.map((p) => {
        if (p.id === periodId) {
          const totalGross = lineItems.reduce((acc, item) => acc + item.grossSalary, 0);
          const totalDeductions = lineItems.reduce((acc, item) => acc + item.totalDeductions, 0);
          const totalFinalPayable = lineItems.reduce((acc, item) => acc + item.finalPayableSalary, 0);
          const totalPaid = lineItems.reduce((acc, item) => acc + item.salaryAlreadyPaid, 0);
          const totalRemainingBalance = lineItems.reduce((acc, item) => acc + item.remainingSalaryBalance, 0);

          return {
            ...p,
            status: 'finalized',
            finalizedAt: new Date().toISOString(),
            finalizedBy: currentRole,
            lineItems: lineItems.map((item) => ({ ...item, isLocked: true })),
            totalGross,
            totalDeductions,
            totalFinalPayable,
            totalPaid,
            totalRemainingBalance,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    // Lock and link deducted expenses to prevent double deductions!
    setExpenses((prev) =>
      prev.map((exp) => {
        if (exp.deductFromSalary && exp.approvalStatus === 'approved') {
          return { ...exp, isDeductedInPayrollId: periodId };
        }
        return exp;
      })
    );

    addAuditLog(
      'PAYROLL_FINALIZED',
      'payroll',
      periodId,
      `Payroll period ${periodId} was finalized and locked against unauthorized edits.`
    );
  };

  const reopenPayroll = (periodId: string, reason: string) => {
    setPayrollPeriods((prev) =>
      prev.map((p) => {
        if (p.id === periodId) {
          return {
            ...p,
            status: 'reopened',
            reopenedAt: new Date().toISOString(),
            reopenedBy: currentRole,
            reopenReason: reason,
            lineItems: p.lineItems.map((item) => ({ ...item, isLocked: false })),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    addAuditLog(
      'PAYROLL_REOPENED',
      'payroll',
      periodId,
      `Payroll period ${periodId} was unlocked and reopened. Reason: "${reason}"`
    );
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.clear();
    setWorkers(DEFAULT_WORKERS);
    setProfessions(DEFAULT_PROFESSIONS);
    setProjects(DEFAULT_PROJECTS);
    setAttendance(generateInitialAttendance());
    setExpenses(DEFAULT_EXPENSES);
    setAdvances(DEFAULT_ADVANCES);
    setPayments(DEFAULT_PAYMENTS);
    setSettings(DEFAULT_SETTINGS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setIndividualProfile(DEFAULT_INDIVIDUAL_PROFILE);
    setIndividualAttendance(generateInitialIndividualAttendance());
    setIndividualExpenses(DEFAULT_INDIVIDUAL_EXPENSES);
    setIndividualAdvances(DEFAULT_INDIVIDUAL_ADVANCES);
    setIndividualPayments(DEFAULT_INDIVIDUAL_PAYMENTS);
    addAuditLog('DEMO_RESET', 'settings', 'all', 'Application restored to realistic demo dataset.');
  };

  const clearAllData = () => {
    setWorkers([]);
    setAttendance([]);
    setExpenses([]);
    setAdvances([]);
    setPayments([]);
    setIndividualAttendance([]);
    setIndividualExpenses([]);
    setIndividualAdvances([]);
    setIndividualPayments([]);
    addAuditLog('DATA_WIPED', 'settings', 'all', 'All workforce records wiped.');
  };

  const exportBackupJSON = (): string => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      settings,
      workers,
      professions,
      projects,
      attendance,
      expenses,
      advances,
      payments,
      payrollPeriods,
      auditLogs,
      individualProfile,
      individualAttendance,
      individualExpenses,
      individualAdvances,
      individualPayments,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setSettings(data.settings);
      if (data.workers) setWorkers(data.workers);
      if (data.professions) setProfessions(data.professions);
      if (data.projects) setProjects(data.projects);
      if (data.attendance) setAttendance(data.attendance);
      if (data.expenses) setExpenses(data.expenses);
      if (data.advances) setAdvances(data.advances);
      if (data.payments) setPayments(data.payments);
      if (data.payrollPeriods) setPayrollPeriods(data.payrollPeriods);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.individualProfile) setIndividualProfile(data.individualProfile);
      if (data.individualAttendance) setIndividualAttendance(data.individualAttendance);
      if (data.individualExpenses) setIndividualExpenses(data.individualExpenses);
      if (data.individualAdvances) setIndividualAdvances(data.individualAdvances);
      if (data.individualPayments) setIndividualPayments(data.individualPayments);
      addAuditLog('BACKUP_RESTORED', 'settings', 'backup', 'System backup successfully imported.');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        theme,
        setTheme,
        currentRole,
        setCurrentRole,
        showModeSelectModal,
        setShowModeSelectModal,
        settings,
        updateSettings,
        workers,
        professions,
        projects,
        attendance,
        expenses,
        advances,
        payments,
        payrollPeriods,
        auditLogs,
        individualProfile,
        individualAttendance,
        individualExpenses,
        individualAdvances,
        individualPayments,
        updateIndividualProfile,
        addAttendanceRecord,
        bulkSaveAttendance,
        addWorker,
        updateWorker,
        archiveWorker,
        addProject,
        updateProject,
        addProfession,
        updateProfession,
        addExpense,
        updateExpense,
        approveExpense,
        addAdvance,
        addPayment,
        finalizePayroll,
        reopenPayroll,
        addAuditLog,
        resetToDemoData,
        clearAllData,
        exportBackupJSON,
        importBackupJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

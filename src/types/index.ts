export type AppMode = 'individual' | 'company';

export type UserRole = 'admin' | 'attendance_manager' | 'accountant' | 'supervisor' | 'viewer';

export type EmploymentStatus = 'active' | 'inactive' | 'archived';

export type EmploymentType = 'hourly' | 'daily' | 'monthly';

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'paid_leave'
  | 'unpaid_leave'
  | 'weekly_off'
  | 'holiday'
  | 'not_marked';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Accommodation'
  | 'Tools & Equipment'
  | 'Materials'
  | 'Fuel'
  | 'Medical'
  | 'Communication'
  | 'Project Expenses'
  | 'Other';

export type ExpenseClassification =
  | 'company_operating'
  | 'project'
  | 'worker_related'
  | 'reimbursable'
  | 'salary_deductible';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type PayrollStatus = 'draft' | 'under_review' | 'finalized' | 'reopened';

export interface ProfessionCategory {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  order: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client?: string;
  location: string;
  startDate: string;
  endDate?: string;
  projectManager: string;
  status: 'active' | 'on_hold' | 'completed';
  budget?: number;
  notes?: string;
  createdAt: string;
}

export interface SalaryRateHistory {
  id: string;
  workerId: string;
  effectiveDate: string;
  employmentType: EmploymentType;
  baseHourlyRate: number;
  dailyWage: number;
  monthlySalary: number;
  standardDailyHours: number;
  scheduledMonthlyHours: number;
  reason?: string;
  recordedAt: string;
}

export interface WorkerSalarySettings {
  employmentType: EmploymentType;
  baseHourlyRate: number;       // e.g. 10 SAR
  dailyWage: number;            // e.g. 150 SAR
  monthlySalary: number;        // e.g. 2400 SAR
  standardDailyHours: number;   // default 8
  scheduledMonthlyHours: number;// default 208
  halfDayFraction: number;      // default 0.5
  paidLeaveFraction: number;    // default 1.0 (full pay)
  unpaidAbsenceDeduction: boolean; // deduct 1/30 or daily rate
  defaultAllowances: number;    // monthly or daily allowance
  effectiveDate: string;
}

export interface WorkerOvertimeSettings {
  policyMultiplier: number;     // 1.0, 1.25, 1.5, 1.75, 2.0, etc.
  restDayMultiplier: number;    // e.g. 2.0
  holidayMultiplier: number;    // e.g. 2.5
  nightShiftMultiplier: number; // e.g. 1.5
  minimumIncrementMinutes: number; // e.g. 15 or 30
  dailyThresholdHours: number;  // standard hours before OT triggers (e.g. 8)
  roundingMethod: 'nearest' | 'floor' | 'ceil';
}

export interface WorkerProfile {
  id: string;
  workerCode: string;          // e.g. "WRK-001"
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  status: EmploymentStatus;
  professionId: string;        // Ref to ProfessionCategory
  assignedProjectId?: string;  // Ref to Project
  supervisor?: string;
  workLocation?: string;
  shiftSchedule?: string;      // e.g. "08:00 - 17:00"
  defaultBreakMinutes: number; // default 60
  weeklyOffDays: number[];     // 0=Sun, 5=Fri, 6=Sat etc. (e.g. [5] for Friday)
  salarySettings: WorkerSalarySettings;
  overtimeSettings: WorkerOvertimeSettings;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndividualProfile {
  fullName: string;
  tradeOrTitle: string;
  phone?: string;
  email?: string;
  currency: string;
  salarySettings: WorkerSalarySettings;
  overtimeSettings: WorkerOvertimeSettings;
  workLocation?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;            // 'individual' in Individual mode
  date: string;                // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string;            // HH:MM (24h)
  checkOut?: string;           // HH:MM (24h)
  breakMinutes: number;        // unpaid break duration in minutes
  totalElapsedHours: number;
  regularHours: number;
  overtimeHours: number;
  isOvernight?: boolean;
  projectId?: string;
  isManuallyAdjusted?: boolean;
  notes?: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  expenseCode: string;         // e.g. "EXP-001"
  date: string;
  workerId?: string;           // Optional, linked worker
  category: ExpenseCategory | string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;              // 'company' | 'worker' | name
  projectId?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Other';
  receiptName?: string;
  receiptUrl?: string;
  classification: ExpenseClassification;
  deductFromSalary: boolean;   // MUST BE TRUE and APPROVED to deduct
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  payrollPeriodId?: string;    // Allocated period
  isDeductedInPayrollId?: string; // Set when payroll finalized to prevent double deduction
  notes?: string;
  createdAt: string;
}

export interface AdvanceRecord {
  id: string;
  advanceCode: string;         // e.g. "ADV-001"
  workerId: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Card' | 'Cheque';
  referenceNumber?: string;
  reason: string;
  recoveredAmount: number;     // Already recovered across finalized payrolls
  isFullyRecovered: boolean;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  paymentCode: string;         // e.g. "PAY-001"
  workerId: string;
  date: string;
  payrollPeriodId?: string;    // Allocated payroll period
  amountPaid: number;
  currency: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Cheque';
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface PayrollLineItem {
  workerId: string;
  workerName: string;
  workerCode: string;
  professionName: string;
  projectName: string;
  employmentType: EmploymentType;
  
  // Attendance stats
  presentDays: number;
  absentDays: number;
  halfDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  weeklyOffDays: number;
  holidayDays: number;
  totalWorkingDays: number;

  regularHours: number;
  overtimeHours: number;

  // Earnings
  baseRate: number;
  basicWages: number;
  overtimeWages: number;
  allowances: number;
  otherEarnings: number;
  grossSalary: number;         // Basic + Overtime + Allowances + Other

  // Deductions breakdown
  foodDeduction: number;
  transportDeduction: number;
  accommodationDeduction: number;
  otherExpenseDeductions: number;
  otherAuthorizedDeductions: number;
  advanceRecovery: number;
  totalDeductions: number;     // Sum of all approved salary-deductible items + advances

  // Final Calculations
  finalPayableSalary: number;  // Gross Salary - Total Deductions
  salaryAlreadyPaid: number;   // Payments allocated to this period
  remainingSalaryBalance: number; // Final Payable - Salary Paid

  // Status & Audit
  isLocked: boolean;
  notes?: string;
}

export interface PayrollPeriod {
  id: string;
  name: string;                // e.g. "October 2026"
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  status: PayrollStatus;
  finalizedAt?: string;
  finalizedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  reopenReason?: string;
  lineItems: PayrollLineItem[];
  totalGross: number;
  totalDeductions: number;
  totalFinalPayable: number;
  totalPaid: number;
  totalRemainingBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: string;
  action: string;              // e.g. "ATTENDANCE_CORRECTED", "PAYROLL_FINALIZED"
  entityType: 'attendance' | 'salary_rate' | 'expense' | 'deduction' | 'advance' | 'payment' | 'payroll' | 'settings' | 'worker';
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface AppSettings {
  appName: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyLogoUrl?: string;
  language: 'en' | 'ar' | 'ur' | 'hi';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  timeFormat: '24h' | '12h';
  timezone: string;
  currency: string;            // SAR, USD, EUR, INR, AED, etc.
  currencySymbol: string;
  decimalPrecision: number;    // default 2
  
  // Standard Policies
  defaultStandardDailyHours: number; // 8
  defaultBreakDurationMinutes: number; // 60
  defaultOvertimeMultiplier: number; // 1.5
  defaultWeekendMultiplier: number; // 2.0
  defaultHolidayMultiplier: number; // 2.0
  overtimeRoundingMethod: 'nearest' | 'floor' | 'ceil';
  roundToMinutes: number; // 15
  nightShiftStartTime: string; // "22:00"
  nightShiftEndTime: string; // "06:00"
  nightShiftMultiplier: number; // 1.25

  // Half day & Absence
  halfDayWageFraction: number; // 0.5
  paidLeaveFraction: number; // 1.0
  treatNotMarkedAsAbsent: boolean; // default false
  
  // Security
  currentRole: UserRole;
  isDemoData: boolean;
}

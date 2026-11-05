import {
  ProfessionCategory,
  Project,
  WorkerProfile,
  IndividualProfile,
  AttendanceRecord,
  ExpenseRecord,
  AdvanceRecord,
  SalaryPayment,
  AppSettings,
  AuditLogEntry,
} from '../types';

export const DEFAULT_PROFESSIONS: ProfessionCategory[] = [
  { id: 'cat-1', name: 'Electrician', code: 'ELEC', isActive: true, order: 1 },
  { id: 'cat-2', name: 'Plumber', code: 'PLMB', isActive: true, order: 2 },
  { id: 'cat-3', name: 'Mason', code: 'MASN', isActive: true, order: 3 },
  { id: 'cat-4', name: 'Data Technician', code: 'DATA', isActive: true, order: 4 },
  { id: 'cat-5', name: 'Helper', code: 'HELP', isActive: true, order: 5 },
  { id: 'cat-6', name: 'Firefighting Technician', code: 'FIRE', isActive: true, order: 6 },
  { id: 'cat-7', name: 'HVAC Technician', code: 'HVAC', isActive: true, order: 7 },
  { id: 'cat-8', name: 'Carpenter', code: 'CARP', isActive: true, order: 8 },
  { id: 'cat-9', name: 'Painter', code: 'PNT', isActive: true, order: 9 },
  { id: 'cat-10', name: 'Welder', code: 'WELD', isActive: true, order: 10 },
  { id: 'cat-11', name: 'General Technician', code: 'TECH', isActive: true, order: 11 },
  { id: 'cat-12', name: 'Other', code: 'OTHR', isActive: true, order: 12 },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    code: 'PRJ-RYD-01',
    name: 'Riyadh Metro Extension Phase 2',
    client: 'Royal Commission for Riyadh City',
    location: 'Olaya, Riyadh',
    startDate: '2026-01-15',
    endDate: '2027-06-30',
    projectManager: 'Eng. Khalid Al-Otaibi',
    status: 'active',
    budget: 4500000,
    notes: 'High priority metro transit infrastructure expansion.',
    createdAt: '2026-01-15',
  },
  {
    id: 'proj-2',
    code: 'PRJ-RS-04',
    name: 'Red Sea Coastal Resort Villa Complex',
    client: 'Red Sea Global',
    location: 'Umluj Coast',
    startDate: '2026-03-01',
    endDate: '2026-12-31',
    projectManager: 'Eng. Sarah Jenkins',
    status: 'active',
    budget: 2800000,
    notes: 'Premium luxury villas and MEP installation.',
    createdAt: '2026-03-01',
  },
  {
    id: 'proj-3',
    code: 'PRJ-JED-09',
    name: 'King Fahd Specialist Hospital MEP Upgrade',
    client: 'Ministry of Health',
    location: 'Al-Andalus, Jeddah',
    startDate: '2026-05-10',
    status: 'active',
    budget: 1650000,
    projectManager: 'Eng. Mohammed Al-Zahrani',
    notes: 'Critical HVAC and fire alarm systems overhaul.',
    createdAt: '2026-05-10',
  },
];

export const DEFAULT_WORKERS: WorkerProfile[] = [
  {
    id: 'wrk-1',
    workerCode: 'WRK-101',
    fullName: 'Ahmed Al-Mansoor',
    phone: '+966 50 123 4567',
    email: 'ahmed.mansoor@example.com',
    address: 'Al-Malaz, Riyadh',
    emergencyContact: '+966 50 999 8888 (Brother)',
    joiningDate: '2025-06-01',
    status: 'active',
    professionId: 'cat-1', // Electrician
    assignedProjectId: 'proj-1',
    supervisor: 'Eng. Khalid Al-Otaibi',
    workLocation: 'Riyadh Metro Site Station 4',
    shiftSchedule: '07:30 - 16:30',
    defaultBreakMinutes: 60,
    weeklyOffDays: [5], // Friday
    salarySettings: {
      employmentType: 'monthly',
      baseHourlyRate: 15,
      dailyWage: 120,
      monthlySalary: 2400,
      standardDailyHours: 8,
      scheduledMonthlyHours: 208,
      halfDayFraction: 0.5,
      paidLeaveFraction: 1.0,
      unpaidAbsenceDeduction: true,
      defaultAllowances: 100, // Allowance from mandatory test
      effectiveDate: '2026-01-01',
    },
    overtimeSettings: {
      policyMultiplier: 1.5,
      restDayMultiplier: 2.0,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.25,
      minimumIncrementMinutes: 15,
      dailyThresholdHours: 8,
      roundingMethod: 'nearest',
    },
    notes: 'Senior certified electrician. Master wiring specialist.',
    createdAt: '2025-06-01',
    updatedAt: '2026-10-31',
  },
  {
    id: 'wrk-2',
    workerCode: 'WRK-102',
    fullName: 'Rajesh Kumar',
    phone: '+966 54 876 5432',
    email: 'rajesh.k@example.com',
    address: 'Batha, Riyadh',
    emergencyContact: '+91 98765 43210 (Wife)',
    joiningDate: '2025-08-15',
    status: 'active',
    professionId: 'cat-7', // HVAC Technician
    assignedProjectId: 'proj-1',
    supervisor: 'Eng. Khalid Al-Otaibi',
    workLocation: 'Riyadh Metro Site Station 4',
    shiftSchedule: '08:00 - 17:00',
    defaultBreakMinutes: 60,
    weeklyOffDays: [5],
    salarySettings: {
      employmentType: 'daily',
      baseHourlyRate: 18.75,
      dailyWage: 150, // 150 SAR per day
      monthlySalary: 3900,
      standardDailyHours: 8,
      scheduledMonthlyHours: 208,
      halfDayFraction: 0.5,
      paidLeaveFraction: 1.0,
      unpaidAbsenceDeduction: true,
      defaultAllowances: 150,
      effectiveDate: '2026-01-01',
    },
    overtimeSettings: {
      policyMultiplier: 1.5,
      restDayMultiplier: 2.0,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.25,
      minimumIncrementMinutes: 15,
      dailyThresholdHours: 8,
      roundingMethod: 'nearest',
    },
    notes: 'Daily wage technician. Ducting and chiller specialist.',
    createdAt: '2025-08-15',
    updatedAt: '2026-10-31',
  },
  {
    id: 'wrk-3',
    workerCode: 'WRK-103',
    fullName: 'Bilal Hussain',
    phone: '+966 56 333 4444',
    email: 'bilal.h@example.com',
    address: 'Umluj Labor Camp',
    emergencyContact: '+92 300 1234567',
    joiningDate: '2026-03-05',
    status: 'active',
    professionId: 'cat-2', // Plumber
    assignedProjectId: 'proj-2',
    supervisor: 'Eng. Sarah Jenkins',
    workLocation: 'Red Sea Resort Zone B',
    shiftSchedule: '07:00 - 16:00',
    defaultBreakMinutes: 60,
    weeklyOffDays: [5],
    salarySettings: {
      employmentType: 'hourly',
      baseHourlyRate: 14,
      dailyWage: 112,
      monthlySalary: 2800,
      standardDailyHours: 8,
      scheduledMonthlyHours: 208,
      halfDayFraction: 0.5,
      paidLeaveFraction: 1.0,
      unpaidAbsenceDeduction: true,
      defaultAllowances: 50,
      effectiveDate: '2026-03-05',
    },
    overtimeSettings: {
      policyMultiplier: 1.5,
      restDayMultiplier: 2.0,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.25,
      minimumIncrementMinutes: 15,
      dailyThresholdHours: 8,
      roundingMethod: 'nearest',
    },
    notes: 'Hourly rate plumber. Sanitary fittings and pipe welding.',
    createdAt: '2026-03-05',
    updatedAt: '2026-10-31',
  },
  {
    id: 'wrk-4',
    workerCode: 'WRK-104',
    fullName: 'Tariq Al-Harbi',
    phone: '+966 55 901 2345',
    email: 'tariq.harbi@example.com',
    joiningDate: '2025-11-01',
    status: 'active',
    professionId: 'cat-4', // Data Technician
    assignedProjectId: 'proj-3',
    supervisor: 'Eng. Mohammed Al-Zahrani',
    workLocation: 'Jeddah Hospital Level 2',
    shiftSchedule: '08:00 - 17:00',
    defaultBreakMinutes: 60,
    weeklyOffDays: [5, 6],
    salarySettings: {
      employmentType: 'monthly',
      baseHourlyRate: 20,
      dailyWage: 160,
      monthlySalary: 3800,
      standardDailyHours: 8,
      scheduledMonthlyHours: 176,
      halfDayFraction: 0.5,
      paidLeaveFraction: 1.0,
      unpaidAbsenceDeduction: true,
      defaultAllowances: 200,
      effectiveDate: '2026-01-01',
    },
    overtimeSettings: {
      policyMultiplier: 1.5,
      restDayMultiplier: 2.0,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.25,
      minimumIncrementMinutes: 15,
      dailyThresholdHours: 8,
      roundingMethod: 'nearest',
    },
    notes: 'Network fiber splicing and server rack maintenance.',
    createdAt: '2025-11-01',
    updatedAt: '2026-10-31',
  },
  {
    id: 'wrk-5',
    workerCode: 'WRK-105',
    fullName: 'Nurul Islam',
    phone: '+966 53 456 7890',
    joiningDate: '2026-02-10',
    status: 'active',
    professionId: 'cat-5', // Helper
    assignedProjectId: 'proj-1',
    supervisor: 'Eng. Khalid Al-Otaibi',
    workLocation: 'Riyadh Metro Site Station 4',
    shiftSchedule: '07:30 - 16:30',
    defaultBreakMinutes: 60,
    weeklyOffDays: [5],
    salarySettings: {
      employmentType: 'daily',
      baseHourlyRate: 12.5,
      dailyWage: 100,
      monthlySalary: 2600,
      standardDailyHours: 8,
      scheduledMonthlyHours: 208,
      halfDayFraction: 0.5,
      paidLeaveFraction: 1.0,
      unpaidAbsenceDeduction: true,
      defaultAllowances: 50,
      effectiveDate: '2026-02-10',
    },
    overtimeSettings: {
      policyMultiplier: 1.5,
      restDayMultiplier: 2.0,
      holidayMultiplier: 2.0,
      nightShiftMultiplier: 1.25,
      minimumIncrementMinutes: 15,
      dailyThresholdHours: 8,
      roundingMethod: 'nearest',
    },
    notes: 'Site labor support and materials loading.',
    createdAt: '2026-02-10',
    updatedAt: '2026-10-31',
  },
];

export const DEFAULT_INDIVIDUAL_PROFILE: IndividualProfile = {
  fullName: 'Tariq Mansoor',
  tradeOrTitle: 'Independent Electrical & Automation Contractor',
  phone: '+966 50 789 0123',
  email: 'tariq.contractor@workledger.pro',
  currency: 'SAR',
  salarySettings: {
    employmentType: 'daily',
    baseHourlyRate: 35,
    dailyWage: 280,
    monthlySalary: 7000,
    standardDailyHours: 8,
    scheduledMonthlyHours: 200,
    halfDayFraction: 0.5,
    paidLeaveFraction: 1.0,
    unpaidAbsenceDeduction: true,
    defaultAllowances: 0,
    effectiveDate: '2026-01-01',
  },
  overtimeSettings: {
    policyMultiplier: 1.5,
    restDayMultiplier: 2.0,
    holidayMultiplier: 2.0,
    nightShiftMultiplier: 1.5,
    minimumIncrementMinutes: 30,
    dailyThresholdHours: 8,
    roundingMethod: 'nearest',
  },
  workLocation: 'Riyadh Commercial & Residential Projects',
  notes: 'Self-employed electrical contractor keeping personal work ledger.',
};

/**
 * Generate high fidelity October 2026 attendance records for all workers
 */
export function generateInitialAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const daysInOctober = 31;

  // Let's create realistic attendance records for October 2026
  for (let day = 1; day <= daysInOctober; day++) {
    const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(2026, 9, day);
    const dayOfWeek = dateObj.getDay(); // 5 = Friday

    for (const worker of DEFAULT_WORKERS) {
      const isOff = worker.weeklyOffDays.includes(dayOfWeek);

      // Distinct statuses to show variety
      if (isOff) {
        records.push({
          id: `att-${worker.id}-${dateStr}`,
          workerId: worker.id,
          date: dateStr,
          status: 'weekly_off',
          breakMinutes: 0,
          totalElapsedHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          projectId: worker.assignedProjectId,
          updatedAt: '2026-10-31',
        });
      } else if (day === 12 && worker.id === 'wrk-2') {
        // Rajesh half day
        records.push({
          id: `att-${worker.id}-${dateStr}`,
          workerId: worker.id,
          date: dateStr,
          status: 'half_day',
          checkIn: '08:00',
          checkOut: '12:00',
          breakMinutes: 0,
          totalElapsedHours: 4,
          regularHours: 4,
          overtimeHours: 0,
          projectId: worker.assignedProjectId,
          notes: 'Medical checkup in afternoon',
          updatedAt: '2026-10-31',
        });
      } else if (day === 18 && worker.id === 'wrk-3') {
        // Bilal paid leave
        records.push({
          id: `att-${worker.id}-${dateStr}`,
          workerId: worker.id,
          date: dateStr,
          status: 'paid_leave',
          breakMinutes: 0,
          totalElapsedHours: 0,
          regularHours: 8,
          overtimeHours: 0,
          projectId: worker.assignedProjectId,
          notes: 'Approved family annual leave',
          updatedAt: '2026-10-31',
        });
      } else if (day === 22 && worker.id === 'wrk-5') {
        // Nurul absent
        records.push({
          id: `att-${worker.id}-${dateStr}`,
          workerId: worker.id,
          date: dateStr,
          status: 'absent',
          breakMinutes: 0,
          totalElapsedHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          projectId: worker.assignedProjectId,
          notes: 'Unexcused absence',
          updatedAt: '2026-10-31',
        });
      } else {
        // Present with realistic overtime
        // Ahmed Al-Mansoor (wrk-1): OT on days 2, 4, 8, 10, 15, 17, 21, 23, 27, 29 (2 hours each = 20 OT hours)
        let otHours = 0;
        let checkOut = '16:30';
        let elapsed = 9;

        if (worker.id === 'wrk-1' && [2, 4, 8, 10, 15, 17, 21, 23, 27, 29].includes(day)) {
          otHours = 2.0;
          checkOut = '18:30';
          elapsed = 11;
        } else if (worker.id === 'wrk-2' && [3, 7, 14, 20, 24].includes(day)) {
          otHours = 1.5;
          checkOut = '18:30';
          elapsed = 10.5;
        }

        records.push({
          id: `att-${worker.id}-${dateStr}`,
          workerId: worker.id,
          date: dateStr,
          status: 'present',
          checkIn: worker.id === 'wrk-1' ? '07:30' : '08:00',
          checkOut,
          breakMinutes: 60,
          totalElapsedHours: elapsed,
          regularHours: 8,
          overtimeHours: otHours,
          projectId: worker.assignedProjectId,
          updatedAt: '2026-10-31',
        });
      }
    }
  }

  return records;
}

/**
 * Generate initial individual mode personal attendance records
 */
export function generateInitialIndividualAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const daysInOctober = 31;

  for (let day = 1; day <= daysInOctober; day++) {
    const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(2026, 9, day);
    const dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 5) {
      records.push({
        id: `ind-att-${dateStr}`,
        workerId: 'individual',
        date: dateStr,
        status: 'weekly_off',
        breakMinutes: 0,
        totalElapsedHours: 0,
        regularHours: 0,
        overtimeHours: 0,
        updatedAt: '2026-10-31',
      });
    } else {
      const hasOt = [3, 6, 11, 15, 20, 25].includes(day);
      records.push({
        id: `ind-att-${dateStr}`,
        workerId: 'individual',
        date: dateStr,
        status: 'present',
        checkIn: '08:00',
        checkOut: hasOt ? '19:00' : '17:00',
        breakMinutes: 60,
        totalElapsedHours: hasOt ? 11 : 9,
        regularHours: 8,
        overtimeHours: hasOt ? 2 : 0,
        notes: hasOt ? 'Urgent panel assembly & testing' : 'Standard site wiring',
        updatedAt: '2026-10-31',
      });
    }
  }

  return records;
}

export const DEFAULT_EXPENSES: ExpenseRecord[] = [
  // 1. Food Expense Deduction for Ahmed Al-Mansoor (Mandatory calculation test spec: 150 SAR)
  {
    id: 'exp-101',
    expenseCode: 'EXP-101',
    date: '2026-10-08',
    workerId: 'wrk-1',
    category: 'Food',
    description: 'Monthly site catering lunch deduction',
    amount: 150,
    currency: 'SAR',
    paidBy: 'company',
    projectId: 'proj-1',
    paymentMethod: 'Cash',
    classification: 'salary_deductible',
    deductFromSalary: true,
    approvalStatus: 'approved',
    approvedBy: 'Eng. Khalid Al-Otaibi',
    approvedAt: '2026-10-09',
    createdAt: '2026-10-08',
    notes: 'Worker agreed lunch supply plan.',
  },
  // 2. Transport Expense Deduction for Ahmed (Mandatory calculation test spec: 100 SAR)
  {
    id: 'exp-102',
    expenseCode: 'EXP-102',
    date: '2026-10-12',
    workerId: 'wrk-1',
    category: 'Transport',
    description: 'Dedicated site commute bus pass',
    amount: 100,
    currency: 'SAR',
    paidBy: 'company',
    projectId: 'proj-1',
    paymentMethod: 'Cash',
    classification: 'salary_deductible',
    deductFromSalary: true,
    approvalStatus: 'approved',
    approvedBy: 'Eng. Khalid Al-Otaibi',
    approvedAt: '2026-10-13',
    createdAt: '2026-10-12',
    notes: 'Air-conditioned express site shuttle deduction.',
  },
  // 3. Other approved expense deduction for Ahmed (Mandatory calculation test spec: 50 SAR)
  {
    id: 'exp-103',
    expenseCode: 'EXP-103',
    date: '2026-10-15',
    workerId: 'wrk-1',
    category: 'Tools & Equipment',
    description: 'Special safety harness replacement subsidy',
    amount: 50,
    currency: 'SAR',
    paidBy: 'company',
    projectId: 'proj-1',
    paymentMethod: 'Cash',
    classification: 'salary_deductible',
    deductFromSalary: true,
    approvalStatus: 'approved',
    approvedBy: 'Accountant',
    approvedAt: '2026-10-16',
    createdAt: '2026-10-15',
    notes: 'Personal safety gear contribution.',
  },
  // 4. Company Operating Expense - MUST NEVER BE DEDUCTED FROM WORKER SALARY
  {
    id: 'exp-104',
    expenseCode: 'EXP-104',
    date: '2026-10-18',
    category: 'Materials',
    description: 'High voltage copper busbars & circuit breakers',
    amount: 8750,
    currency: 'SAR',
    paidBy: 'company',
    projectId: 'proj-1',
    paymentMethod: 'Bank Transfer',
    classification: 'company_operating',
    deductFromSalary: false,
    approvalStatus: 'approved',
    approvedBy: 'General Manager',
    approvedAt: '2026-10-18',
    createdAt: '2026-10-18',
    notes: 'Direct project bulk procurement.',
  },
  // 5. Deductible for Rajesh
  {
    id: 'exp-105',
    expenseCode: 'EXP-105',
    date: '2026-10-19',
    workerId: 'wrk-2',
    category: 'Accommodation',
    description: 'Camp room utility & maintenance contribution',
    amount: 120,
    currency: 'SAR',
    paidBy: 'company',
    projectId: 'proj-1',
    paymentMethod: 'Cash',
    classification: 'salary_deductible',
    deductFromSalary: true,
    approvalStatus: 'approved',
    approvedBy: 'Accountant',
    createdAt: '2026-10-19',
  },
];

export const DEFAULT_INDIVIDUAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'ind-exp-1',
    expenseCode: 'EXP-IND-01',
    date: '2026-10-06',
    workerId: 'individual',
    category: 'Tools & Equipment',
    description: 'Fluke digital multimeter & insulated screwdrivers',
    amount: 320,
    currency: 'SAR',
    paidBy: 'Self',
    paymentMethod: 'Card',
    classification: 'worker_related',
    deductFromSalary: true,
    approvalStatus: 'approved',
    createdAt: '2026-10-06',
    notes: 'Professional test kit for clients.',
  },
  {
    id: 'ind-exp-2',
    expenseCode: 'EXP-IND-02',
    date: '2026-10-14',
    workerId: 'individual',
    category: 'Fuel',
    description: 'Site travel petrol across Olaya and Batha sites',
    amount: 140,
    currency: 'SAR',
    paidBy: 'Self',
    paymentMethod: 'Card',
    classification: 'reimbursable',
    deductFromSalary: false,
    approvalStatus: 'approved',
    createdAt: '2026-10-14',
  },
  {
    id: 'ind-exp-3',
    expenseCode: 'EXP-IND-03',
    date: '2026-10-22',
    workerId: 'individual',
    category: 'Materials',
    description: 'PVC conduit pipes & junction boxes for villa client',
    amount: 210,
    currency: 'SAR',
    paidBy: 'Self',
    paymentMethod: 'Cash',
    classification: 'reimbursable',
    deductFromSalary: false,
    approvalStatus: 'approved',
    createdAt: '2026-10-22',
  },
];

export const DEFAULT_ADVANCES: AdvanceRecord[] = [
  // Mandatory calculation test spec: Advance recovery = 200 SAR for Ahmed
  {
    id: 'adv-101',
    advanceCode: 'ADV-101',
    workerId: 'wrk-1',
    date: '2026-10-05',
    amount: 200,
    currency: 'SAR',
    paymentMethod: 'Cash',
    referenceNumber: 'ADV-REC-8841',
    reason: 'Emergency remittance advance for family',
    recoveredAmount: 0,
    isFullyRecovered: false,
    recordedBy: 'Accountant',
    createdAt: '2026-10-05',
    notes: 'Approved to be deducted in October 2026 payroll.',
  },
  {
    id: 'adv-102',
    advanceCode: 'ADV-102',
    workerId: 'wrk-3',
    date: '2026-10-10',
    amount: 300,
    currency: 'SAR',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'TRX-9921',
    reason: 'Medical clinic medication advance',
    recoveredAmount: 0,
    isFullyRecovered: false,
    recordedBy: 'Accountant',
    createdAt: '2026-10-10',
  },
];

export const DEFAULT_INDIVIDUAL_ADVANCES: AdvanceRecord[] = [
  {
    id: 'ind-adv-1',
    advanceCode: 'ADV-IND-01',
    workerId: 'individual',
    date: '2026-10-04',
    amount: 500,
    currency: 'SAR',
    paymentMethod: 'Cash',
    reason: 'Client upfront deposit for materials',
    recoveredAmount: 0,
    isFullyRecovered: false,
    recordedBy: 'Client Al-Aziziah Villa',
    createdAt: '2026-10-04',
  },
];

export const DEFAULT_PAYMENTS: SalaryPayment[] = [
  // Mandatory calculation test spec: Salary Already Paid = 500 SAR for Ahmed Al-Mansoor
  {
    id: 'pay-101',
    paymentCode: 'PAY-101',
    workerId: 'wrk-1',
    date: '2026-10-24',
    payrollPeriodId: 'oct-2026',
    amountPaid: 500,
    currency: 'SAR',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'SA-ALINMA-482910',
    notes: 'Mid-month partial salary transfer',
    recordedBy: 'Accountant',
    createdAt: '2026-10-24',
  },
  {
    id: 'pay-102',
    paymentCode: 'PAY-102',
    workerId: 'wrk-2',
    date: '2026-10-25',
    payrollPeriodId: 'oct-2026',
    amountPaid: 800,
    currency: 'SAR',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'SA-SNB-119283',
    notes: 'Bi-weekly wage tranche',
    recordedBy: 'Accountant',
    createdAt: '2026-10-25',
  },
];

export const DEFAULT_INDIVIDUAL_PAYMENTS: SalaryPayment[] = [
  {
    id: 'ind-pay-1',
    paymentCode: 'PAY-IND-01',
    date: '2026-10-20',
    workerId: 'individual',
    amountPaid: 1500,
    currency: 'SAR',
    paymentMethod: 'Bank Transfer',
    referenceNumber: 'AL-RAJHI-5542',
    notes: 'Client milestone completion payment',
    recordedBy: 'Tariq Mansoor',
    createdAt: '2026-10-20',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'WorkLedger Pro',
  companyName: 'Al-Bait Construction & Electro-Mechanical Co.',
  companyAddress: 'King Fahd Road, Al-Sahafa District, Riyadh, Saudi Arabia',
  companyPhone: '+966 11 456 7890',
  language: 'en',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  timezone: 'Asia/Riyadh (GMT+3)',
  currency: 'SAR',
  currencySymbol: 'SAR',
  decimalPrecision: 2,

  defaultStandardDailyHours: 8,
  defaultBreakDurationMinutes: 60,
  defaultOvertimeMultiplier: 1.5,
  defaultWeekendMultiplier: 2.0,
  defaultHolidayMultiplier: 2.0,
  overtimeRoundingMethod: 'nearest',
  roundToMinutes: 15,
  nightShiftStartTime: '22:00',
  nightShiftEndTime: '06:00',
  nightShiftMultiplier: 1.25,

  halfDayWageFraction: 0.5,
  paidLeaveFraction: 1.0,
  treatNotMarkedAsAbsent: false,

  currentRole: 'admin',
  isDemoData: true,
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-01 08:00:00',
    userId: 'usr-1',
    userName: 'System Administrator',
    role: 'Administrator',
    action: 'SYSTEM_INITIALIZED',
    entityType: 'settings',
    entityId: 'sys-01',
    details: 'WorkLedger Pro initialized with standard labor and overtime configurations.',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-05 10:15:00',
    userId: 'usr-2',
    userName: 'Accountant Tariq',
    role: 'Accountant',
    action: 'ADVANCE_ISSUED',
    entityType: 'advance',
    entityId: 'adv-101',
    details: 'Emergency advance of 200.00 SAR recorded for Ahmed Al-Mansoor (WRK-101).',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-08 14:30:00',
    userId: 'usr-3',
    userName: 'Eng. Khalid Al-Otaibi',
    role: 'Supervisor',
    action: 'EXPENSE_APPROVED',
    entityType: 'expense',
    entityId: 'exp-101',
    details: 'Food expense deduction of 150.00 SAR approved for worker Ahmed Al-Mansoor.',
  },
  {
    id: 'log-4',
    timestamp: '2026-10-24 16:45:00',
    userId: 'usr-2',
    userName: 'Accountant Tariq',
    role: 'Accountant',
    action: 'SALARY_PAYMENT_RECORDED',
    entityType: 'payment',
    entityId: 'pay-101',
    details: 'Partial salary transfer of 500.00 SAR recorded for Ahmed Al-Mansoor.',
  },
];

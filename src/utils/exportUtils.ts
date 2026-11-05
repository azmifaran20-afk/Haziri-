import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { PayrollLineItem, AttendanceRecord, ExpenseRecord, AdvanceRecord, SalaryPayment, AppSettings } from '../types';

/**
 * Escapes CSV field against formula injection (protecting against `=,+,-,@`)
 */
export function sanitizeForCSV(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports data to CSV and triggers browser download
 */
export function exportToCSV(filename: string, headers: string[], rows: any[][]) {
  const csvContent = [
    headers.map(sanitizeForCSV).join(','),
    ...rows.map(row => row.map(sanitizeForCSV).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports data to Excel XLSX and triggers download
 */
export function exportToExcel(filename: string, sheetName: string, headers: string[], rows: any[][]) {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Generates and downloads a clean, professional PDF for a single Worker Salary Statement (Pay Slip)
 */
export function exportWorkerSalarySlipPDF(
  item: PayrollLineItem,
  periodName: string,
  settings: AppSettings,
  isIndividualMode: boolean = false
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const currency = settings.currency || 'SAR';
  const orgName = isIndividualMode ? (item.workerName || 'WorkLedger Pro') : (settings.companyName || 'WorkLedger Pro');

  // Header banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKLEDGER PRO', 14, 15);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(isIndividualMode ? 'PERSONAL SALARY & EARNINGS STATEMENT' : 'OFFICIAL SALARY & PAYROLL STATEMENT', 14, 23);

  doc.setFontSize(10);
  doc.text(`Period: ${periodName}`, 145, 15);
  doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 145, 22);

  // Worker Info Block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 38, 182, 36, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('WORKER / CONTRACTOR DETAILS', 20, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${item.workerName}`, 20, 54);
  doc.text(`Worker ID: ${item.workerCode}`, 20, 60);
  doc.text(`Type: ${item.employmentType.toUpperCase()}`, 20, 66);

  if (!isIndividualMode) {
    doc.text(`Profession: ${item.professionName || 'General'}`, 105, 54);
    doc.text(`Project: ${item.projectName || 'All'}`, 105, 60);
    doc.text(`Organization: ${orgName}`, 105, 66);
  }

  // Attendance summary row
  let y = 80;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. ATTENDANCE & WORKING HOURS SUMMARY', 14, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 14, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Present Days', 18, y + 5);
  doc.text('Half Days', 50, y + 5);
  doc.text('Leaves / Off', 80, y + 5);
  doc.text('Regular Hours', 115, y + 5);
  doc.text('Overtime Hours', 155, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`${item.presentDays} days`, 18, y + 11);
  doc.text(`${item.halfDays} days`, 50, y + 11);
  doc.text(`${item.paidLeaveDays + item.weeklyOffDays + item.holidayDays} days`, 80, y + 11);
  doc.text(`${item.regularHours.toFixed(1)} hrs`, 115, y + 11);
  doc.text(`${item.overtimeHours.toFixed(1)} hrs`, 155, y + 11);

  // Gross Earnings breakdown
  y += 22;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. EARNINGS & GROSS WAGES (FORMULA 1)', 14, y);

  y += 6;
  const drawRow = (label: string, value: string, isHeader = false, isBold = false) => {
    if (isHeader) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    }
    doc.setFontSize(9);
    doc.text(label, 18, y + 5);
    doc.text(value, 192, y + 5, { align: 'right' });
    y += 7;
  };

  drawRow('Earnings Description', `Amount (${currency})`, true);
  drawRow(`Basic Wages (${item.employmentType === 'hourly' ? `${item.baseRate} /hr` : item.employmentType === 'daily' ? `${item.baseRate} /day` : 'Monthly base'})`, `${item.basicWages.toFixed(2)} ${currency}`);
  drawRow(`Overtime Wages (${item.overtimeHours.toFixed(1)} OT hrs)`, `${item.overtimeWages.toFixed(2)} ${currency}`);
  drawRow('Allowances & Incentives', `${item.allowances.toFixed(2)} ${currency}`);
  drawRow('TOTAL GROSS SALARY', `${item.grossSalary.toFixed(2)} ${currency}`, false, true);

  // Deductions breakdown
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. DEDUCTIONS & ADVANCE RECOVERY (FORMULA 2)', 14, y);

  y += 6;
  drawRow('Deduction Description', `Amount (${currency})`, true);
  drawRow('Food Expense Deduction (Approved)', `-${item.foodDeduction.toFixed(2)} ${currency}`);
  drawRow('Transport Expense Deduction (Approved)', `-${item.transportDeduction.toFixed(2)} ${currency}`);
  drawRow('Accommodation Deduction (Approved)', `-${item.accommodationDeduction.toFixed(2)} ${currency}`);
  drawRow('Other Approved Expense Deductions', `-${item.otherExpenseDeductions.toFixed(2)} ${currency}`);
  drawRow('Advance Salary Recovery (Scheduled)', `-${item.advanceRecovery.toFixed(2)} ${currency}`);
  drawRow('TOTAL APPROVED DEDUCTIONS', `-${item.totalDeductions.toFixed(2)} ${currency}`, false, true);

  // Final Net Payable & Remaining Balance
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('4. FINAL SALARY & PAYMENT BALANCE (FORMULAS 3 & 4)', 14, y);

  y += 6;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(14, y, 182, 28, 2, 2, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(6, 78, 59); // emerald-900
  doc.text('FINAL PAYABLE SALARY (Gross Salary - Total Deductions):', 20, y + 8);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${item.finalPayableSalary.toFixed(2)} ${currency}`, 190, y + 8, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Less: Salary Already Paid / Transferred:', 20, y + 17);
  doc.text(`-${item.salaryAlreadyPaid.toFixed(2)} ${currency}`, 190, y + 17, { align: 'right' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('REMAINING SALARY BALANCE (Payable - Paid):', 20, y + 24);
  doc.text(`${item.remainingSalaryBalance.toFixed(2)} ${currency}`, 190, y + 24, { align: 'right' });

  // Signatures
  y += 38;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.line(20, y, 70, y);
  doc.text('Worker / Contractor Signature', 20, y + 5);

  doc.line(140, y, 190, y);
  doc.text('Authorized Signatory / Accountant', 140, y + 5);

  doc.save(`Salary_Slip_${item.workerCode}_${periodName.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generates Consolidated All-Worker Payroll PDF
 */
export function exportConsolidatedPayrollPDF(
  lineItems: PayrollLineItem[],
  periodName: string,
  settings: AppSettings
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const currency = settings.currency || 'SAR';

  // Header banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${settings.companyName || 'WorkLedger Pro'} - CONSOLIDATED PAYROLL REGISTER`, 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${periodName} | Exported: ${new Date().toISOString().split('T')[0]} | Currency: ${currency}`, 14, 19);

  let y = 34;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y, 277, 8, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  doc.text('ID', 12, y + 5.5);
  doc.text('Worker Name', 28, y + 5.5);
  doc.text('Profession', 68, y + 5.5);
  doc.text('Days (P/A/H)', 105, y + 5.5);
  doc.text('Reg H', 130, y + 5.5);
  doc.text('OT H', 145, y + 5.5);
  doc.text('Gross Sal', 162, y + 5.5);
  doc.text('Deductions', 188, y + 5.5);
  doc.text('Final Payable', 215, y + 5.5);
  doc.text('Paid', 245, y + 5.5);
  doc.text('Balance', 270, y + 5.5);

  y += 9;
  doc.setFont('helvetica', 'normal');

  let totalGross = 0;
  let totalDeductions = 0;
  let totalPayable = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  lineItems.forEach((item, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 2, 277, 7, 'F');
    }

    totalGross += item.grossSalary;
    totalDeductions += item.totalDeductions;
    totalPayable += item.finalPayableSalary;
    totalPaid += item.salaryAlreadyPaid;
    totalBalance += item.remainingSalaryBalance;

    doc.setTextColor(15, 23, 42);
    doc.text(item.workerCode, 12, y + 3);
    doc.text(item.workerName.substring(0, 22), 28, y + 3);
    doc.text((item.professionName || 'General').substring(0, 18), 68, y + 3);
    doc.text(`${item.presentDays}/${item.absentDays}/${item.halfDays}`, 105, y + 3);
    doc.text(`${item.regularHours.toFixed(1)}`, 130, y + 3);
    doc.text(`${item.overtimeHours.toFixed(1)}`, 145, y + 3);
    doc.text(`${item.grossSalary.toFixed(2)}`, 162, y + 3);
    doc.text(`-${item.totalDeductions.toFixed(2)}`, 188, y + 3);
    doc.text(`${item.finalPayableSalary.toFixed(2)}`, 215, y + 3);
    doc.text(`${item.salaryAlreadyPaid.toFixed(2)}`, 245, y + 3);
    doc.text(`${item.remainingSalaryBalance.toFixed(2)}`, 270, y + 3);

    y += 7;
  });

  // Totals Row
  y += 2;
  doc.setFillColor(226, 232, 240);
  doc.rect(10, y - 2, 277, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`TOTALS (${lineItems.length} Workers):`, 28, y + 3.5);
  doc.text(`${totalGross.toFixed(2)}`, 162, y + 3.5);
  doc.text(`-${totalDeductions.toFixed(2)}`, 188, y + 3.5);
  doc.text(`${totalPayable.toFixed(2)}`, 215, y + 3.5);
  doc.text(`${totalPaid.toFixed(2)}`, 245, y + 3.5);
  doc.text(`${totalBalance.toFixed(2)}`, 270, y + 3.5);

  doc.save(`Consolidated_Payroll_${periodName.replace(/\s+/g, '_')}.pdf`);
}

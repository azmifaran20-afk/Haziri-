import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AdvanceRecord, SalaryPayment } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  X,
  User,
  Banknote,
  Receipt,
} from 'lucide-react';

export const AdvancesPaymentsView: React.FC = () => {
  const {
    mode,
    workers,
    advances,
    payments,
    individualAdvances,
    individualPayments,
    addAdvance,
    addPayment,
    settings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'advances' | 'payments' | 'ledger'>('advances');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('all');

  // Modals
  const [showAdvanceModal, setShowAdvanceModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  // Advance Form State
  const [advWorkerId, setAdvWorkerId] = useState<string>('');
  const [advDate, setAdvDate] = useState<string>('2026-10-31');
  const [advAmount, setAdvAmount] = useState<number>(200);
  const [advMethod, setAdvMethod] = useState<'Cash' | 'Bank Transfer' | 'Card' | 'Cheque'>('Cash');
  const [advRef, setAdvRef] = useState<string>('');
  const [advReason, setAdvReason] = useState<string>('Family urgent emergency advance');
  const [advNotes, setAdvNotes] = useState<string>('');

  // Payment Form State
  const [payWorkerId, setPayWorkerId] = useState<string>('');
  const [payDate, setPayDate] = useState<string>('2026-10-31');
  const [payAmount, setPayAmount] = useState<number>(500);
  const [payMethod, setPayMethod] = useState<'Bank Transfer' | 'Cash' | 'Cheque'>('Bank Transfer');
  const [payRef, setPayRef] = useState<string>('');
  const [payPeriod, setPayPeriod] = useState<string>('oct-2026');
  const [payNotes, setPayNotes] = useState<string>('');

  const currency = settings.currency || 'SAR';

  const currentAdvances = mode === 'individual' ? individualAdvances : advances;
  const currentPayments = mode === 'individual' ? individualPayments : payments;

  // Filtered lists
  const filteredAdvances = useMemo(() => {
    return currentAdvances.filter((a) => {
      if (selectedWorkerId !== 'all' && a.workerId !== selectedWorkerId) return false;
      if (
        searchQuery &&
        !a.reason.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.advanceCode.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [currentAdvances, selectedWorkerId, searchQuery]);

  const filteredPayments = useMemo(() => {
    return currentPayments.filter((p) => {
      if (selectedWorkerId !== 'all' && p.workerId !== selectedWorkerId) return false;
      if (
        searchQuery &&
        !p.paymentCode.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(p.referenceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [currentPayments, selectedWorkerId, searchQuery]);

  // Totals
  const totalAdvancesIssued = filteredAdvances.reduce((sum, a) => sum + a.amount, 0);
  const totalAdvancesRecovered = filteredAdvances.reduce((sum, a) => sum + a.recoveredAmount, 0);
  const outstandingAdvanceBalance = totalAdvancesIssued - totalAdvancesRecovered;
  const totalSalaryDisbursed = filteredPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  // Handle Advance Save
  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdv: AdvanceRecord = {
      id: `adv-${Date.now()}`,
      advanceCode: `ADV-${100 + currentAdvances.length + 1}`,
      workerId: mode === 'individual' ? 'individual' : advWorkerId,
      date: advDate,
      amount: advAmount,
      currency,
      paymentMethod: advMethod,
      referenceNumber: advRef || undefined,
      reason: advReason,
      recoveredAmount: 0,
      isFullyRecovered: false,
      recordedBy: 'Accountant',
      notes: advNotes,
      createdAt: new Date().toISOString(),
    };
    addAdvance(newAdv);
    setShowAdvanceModal(false);
  };

  // Handle Payment Save
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPay: SalaryPayment = {
      id: `pay-${Date.now()}`,
      paymentCode: `PAY-${100 + currentPayments.length + 1}`,
      workerId: mode === 'individual' ? 'individual' : payWorkerId,
      date: payDate,
      amountPaid: payAmount,
      currency,
      paymentMethod: payMethod,
      referenceNumber: payRef || undefined,
      payrollPeriodId: payPeriod,
      notes: payNotes,
      recordedBy: 'Accountant',
      createdAt: new Date().toISOString(),
    };
    addPayment(newPay);
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <span>Advances & Salary Payments</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict transaction tracking: Advances are kept separate from ordinary salary disbursements with zero double-counting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setAdvWorkerId(workers[0]?.id || '');
              setShowAdvanceModal(true);
            }}
            className="py-2 px-3.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Issue Advance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPayWorkerId(workers[0]?.id || '');
              setShowPaymentModal(true);
            }}
            className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Disburse Salary Payment</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Advances Issued</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalAdvancesIssued, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{filteredAdvances.length} Advance Vouchers</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Advances Recovered in Payroll</div>
          <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {formatCurrency(totalAdvancesRecovered, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">Deducted in locked payrolls</div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-sm">
          <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            Outstanding Advance Balance
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
            {formatCurrency(outstandingAdvanceBalance, currency)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Pending Recovery</div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            Total Salary Payments Disbursed
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
            {formatCurrency(totalSalaryDisbursed, currency)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {filteredPayments.length} Tranches Transferred
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('advances')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'advances'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Advances Register ({filteredAdvances.length})</span>
          {activeTab === 'advances' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 px-3 transition-colors relative ${
            activeTab === 'payments'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Salary Payments Disbursed ({filteredPayments.length})</span>
          {activeTab === 'payments' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: ADVANCES REGISTER
         ========================================================================= */}
      {activeTab === 'advances' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Advance Code</th>
                  <th className="py-3 px-4">Date</th>
                  {mode === 'company' && <th className="py-3 px-4">Worker</th>}
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Advance Amount</th>
                  <th className="py-3 px-4 text-right">Recovered</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredAdvances.length === 0 ? (
                  <tr>
                    <td colSpan={mode === 'company' ? 9 : 8} className="py-10 text-center text-slate-500">
                      No advance records found.
                    </td>
                  </tr>
                ) : (
                  filteredAdvances.map((adv) => {
                    const w = workers.find((item) => item.id === adv.workerId);
                    const pending = Math.max(0, adv.amount - adv.recoveredAmount);
                    return (
                      <tr
                        key={adv.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {adv.advanceCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {adv.date}
                        </td>

                        {mode === 'company' && (
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {w?.fullName || 'Worker'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {w?.workerCode || adv.workerId}
                            </div>
                          </td>
                        )}

                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <div>{adv.reason}</div>
                          {adv.referenceNumber && (
                            <div className="text-[10px] text-slate-500">
                              Ref: {adv.referenceNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {adv.paymentMethod}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(adv.amount, currency)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatCurrency(adv.recoveredAmount, currency)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(pending, currency)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {pending === 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Recovered
                            </span>
                          ) : (
                            <span className="font-semibold text-amber-600">
                              Active Balance
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SALARY PAYMENTS REGISTER
         ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Payment Code</th>
                  <th className="py-3 px-4">Disbursed Date</th>
                  {mode === 'company' && <th className="py-3 px-4">Worker</th>}
                  <th className="py-3 px-4">Payroll Period Allocated</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Bank Ref / Transaction ID</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={mode === 'company' ? 8 : 7} className="py-10 text-center text-slate-500">
                      No salary disbursements recorded.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((pay) => {
                    const w = workers.find((item) => item.id === pay.workerId);
                    return (
                      <tr
                        key={pay.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {pay.paymentCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {pay.date}
                        </td>

                        {mode === 'company' && (
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {w?.fullName || 'Worker'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {w?.workerCode || pay.workerId}
                            </div>
                          </td>
                        )}

                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {pay.payrollPeriodId || 'October 2026'}
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {pay.paymentMethod}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                          {pay.referenceNumber || 'N/A'}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(pay.amountPaid, currency)}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {pay.recordedBy}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          ISSUE ADVANCE MODAL
         ========================================================================= */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Record Worker Salary Advance
              </h3>
              <button
                type="button"
                onClick={() => setShowAdvanceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvance} className="space-y-4">
              {mode === 'company' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Worker *
                  </label>
                  <select
                    value={advWorkerId}
                    onChange={(e) => setAdvWorkerId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    {workers.map((w) => (
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
                    Advance Date *
                  </label>
                  <input
                    type="date"
                    value={advDate}
                    onChange={(e) => setAdvDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={advAmount}
                    onChange={(e) => setAdvAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={advMethod}
                    onChange={(e) => setAdvMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Reference / Voucher #
                  </label>
                  <input
                    type="text"
                    value={advRef}
                    onChange={(e) => setAdvRef(e.target.value)}
                    placeholder="ADV-VOUCH-102"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reason for Advance *
                </label>
                <input
                  type="text"
                  value={advReason}
                  onChange={(e) => setAdvReason(e.target.value)}
                  required
                  placeholder="e.g. Urgent family medical assistance"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Confirm & Issue Advance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DISBURSE SALARY PAYMENT MODAL
         ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Disburse Salary Payment
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              {mode === 'company' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Select Worker *
                  </label>
                  <select
                    value={payWorkerId}
                    onChange={(e) => setPayWorkerId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    {workers.map((w) => (
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
                    Disbursement Date *
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Amount Paid ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (SARIE/Wire)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Transaction Ref #
                  </label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="SA-BANK-TX-998"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Allocate to Payroll Period
                </label>
                <input
                  type="text"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Record Salary Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

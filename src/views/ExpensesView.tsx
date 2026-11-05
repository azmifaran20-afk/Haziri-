import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExpenseRecord, ExpenseClassification, ApprovalStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Receipt,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  User,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    mode,
    workers,
    projects,
    expenses,
    individualExpenses,
    addExpense,
    updateExpense,
    approveExpense,
    settings,
  } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);

  // Form State
  const [date, setDate] = useState<string>('2026-10-31');
  const [workerId, setWorkerId] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(100);
  const [paidBy, setPaidBy] = useState<string>('company');
  const [projectId, setProjectId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card' | 'Other'>('Cash');
  const [classification, setClassification] = useState<ExpenseClassification>('salary_deductible');
  const [deductFromSalary, setDeductFromSalary] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const currency = settings.currency || 'SAR';
  const currentList = mode === 'individual' ? individualExpenses : expenses;

  const categories = [
    'Food',
    'Transport',
    'Accommodation',
    'Tools & Equipment',
    'Materials',
    'Fuel',
    'Medical',
    'Communication',
    'Project Expenses',
    'Other',
  ];

  const filteredExpenses = useMemo(() => {
    return currentList.filter((e) => {
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterClassification !== 'all' && e.classification !== filterClassification) return false;
      if (filterApproval !== 'all' && e.approvalStatus !== filterApproval) return false;
      if (
        searchQuery &&
        !e.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.expenseCode.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [currentList, filterCategory, filterClassification, filterApproval, searchQuery]);

  // Aggregate stats
  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalApprovedSalaryDeductions = filteredExpenses
    .filter((e) => e.classification === 'salary_deductible' && e.approvalStatus === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCompanyOperating = filteredExpenses
    .filter((e) => e.classification === 'company_operating')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDate('2026-10-31');
    setWorkerId(workers[0]?.id || '');
    setCategory('Food');
    setDescription('');
    setAmount(150);
    setPaidBy(mode === 'individual' ? 'Self' : 'company');
    setProjectId('');
    setPaymentMethod('Cash');
    setClassification(mode === 'individual' ? 'worker_related' : 'salary_deductible');
    setDeductFromSalary(true);
    setNotes('');
    setShowModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();

    // Enforcement: company operating expense CANNOT be deducted from worker salary!
    const effectiveDeduct = classification === 'salary_deductible' ? deductFromSalary : false;

    const newExpense: ExpenseRecord = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      expenseCode: editingExpense ? editingExpense.expenseCode : `EXP-${100 + currentList.length + 1}`,
      date,
      workerId: mode === 'individual' ? 'individual' : (workerId || undefined),
      category,
      description,
      amount,
      currency,
      paidBy,
      projectId: projectId || undefined,
      paymentMethod,
      classification,
      deductFromSalary: effectiveDeduct,
      approvalStatus: 'approved',
      notes,
      createdAt: editingExpense ? editingExpense.createdAt : new Date().toISOString(),
    };

    if (editingExpense) {
      updateExpense(newExpense);
    } else {
      addExpense(newExpense);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Expense & Salary Deduction Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Strict isolation: Company operating expenses are NEVER deducted from workers. Only approved salary-deductible items affect payroll.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total Expenses Logged</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalAmount, currency)}
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{filteredExpenses.length} Records</div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-sm">
          <div className="text-xs text-rose-700 dark:text-rose-400 font-medium">
            Approved Worker Salary Deductions
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            -{formatCurrency(totalApprovedSalaryDeductions, currency)}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">
            Affects Formula 2 (Total Deductions)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 shadow-sm">
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">
            Company Operating Expenses
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
            {formatCurrency(totalCompanyOperating, currency)}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
            Strictly Isolated (0 SAR deducted from workers)
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Classification filter */}
          {mode === 'company' && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <option value="all">All Classifications</option>
                <option value="salary_deductible">Salary-Deductible</option>
                <option value="company_operating">Company Operating</option>
                <option value="project">Project Direct</option>
                <option value="reimbursable">Reimbursable</option>
              </select>
            </div>
          )}

          {/* Approval Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="bg-transparent font-medium outline-none text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Approvals</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search description or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-xs"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Expense Code</th>
                <th className="py-3 px-4">Date</th>
                {mode === 'company' && <th className="py-3 px-4">Worker Allocated</th>}
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-center">Deduct From Salary?</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Approval</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={mode === 'company' ? 10 : 9} className="py-10 text-center text-slate-500">
                    No expense records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const w = workers.find((item) => item.id === exp.workerId);
                  const isDeductible = exp.deductFromSalary && exp.classification === 'salary_deductible';

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {exp.expenseCode}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {exp.date}
                      </td>

                      {mode === 'company' && (
                        <td className="py-3 px-4">
                          {w ? (
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {w.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">{w.workerCode}</div>
                            </div>
                          ) : (
                            <span className="text-slate-600 dark:text-slate-300">General / Company</span>
                          )}
                        </td>
                      )}

                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {exp.category}
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {exp.description}
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize font-medium text-slate-600 dark:text-slate-300">
                          {exp.classification.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isDeductible ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            YES (Salary Deductible)
                          </span>
                        ) : (
                          <span className="text-slate-600 dark:text-slate-300">NO (Excluded)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(exp.amount, currency)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {exp.approvalStatus === 'approved' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                          </span>
                        )}
                        {exp.approvalStatus === 'pending' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <AlertTriangle className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                        {exp.approvalStatus === 'rejected' && (
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                            <XCircle className="w-3.5 h-3.5" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {exp.approvalStatus === 'pending' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => approveExpense(exp.id, true)}
                              className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => approveExpense(exp.id, false)}
                              className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-600 dark:text-slate-300">Recorded</span>
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

      {/* =========================================================================
          RECORD EXPENSE MODAL
         ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Record New Expense Entry
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
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
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {mode === 'company' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Allocated Worker (Leave empty for company general expense)
                  </label>
                  <select
                    value={workerId}
                    onChange={(e) => setWorkerId(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="">General Company Expense (No Worker)</option>
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
                    Expense Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Expense Classification *
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => {
                      const val = e.target.value as ExpenseClassification;
                      setClassification(val);
                      if (val !== 'salary_deductible') {
                        setDeductFromSalary(false);
                      } else {
                        setDeductFromSalary(true);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-semibold text-emerald-600"
                  >
                    <option value="salary_deductible">Salary-Deductible (from worker)</option>
                    <option value="company_operating">Company Operating (Zero worker deduction)</option>
                    <option value="project">Project Direct Expense</option>
                    <option value="reimbursable">Reimbursable Expense</option>
                    <option value="worker_related">Worker Related</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Description / Item Details *
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="e.g. Monthly site catering meals deduction"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              {/* Deduct from salary checkbox */}
              {classification === 'salary_deductible' && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                  <label className="flex items-center gap-2 cursor-pointer text-rose-900 dark:text-rose-200 font-semibold">
                    <input
                      type="checkbox"
                      checked={deductFromSalary}
                      onChange={(e) => setDeductFromSalary(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Deduct this amount from worker's final payable salary</span>
                  </label>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 pl-6">
                    Will be calculated under Total Deductions (Formula 2) upon payroll calculation.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Paid By
                  </label>
                  <input
                    type="text"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Receipt voucher reference or supervisor sign-off"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                >
                  Save Expense Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

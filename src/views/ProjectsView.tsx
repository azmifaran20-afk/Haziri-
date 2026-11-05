import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Briefcase,
  Plus,
  Edit2,
  Calendar,
  MapPin,
  User,
  Users,
  Banknote,
  Receipt,
  X,
  Search,
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, workers, expenses, addProject, updateProject, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form State
  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [client, setClient] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('');
  const [projectManager, setProjectManager] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'on_hold' | 'completed'>('active');
  const [budget, setBudget] = useState<number>(1000000);
  const [notes, setNotes] = useState<string>('');

  const currency = settings.currency || 'SAR';

  const filteredProjects = projects.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setCode(`PRJ-${100 + projects.length + 1}`);
    setName('');
    setClient('');
    setLocation('Riyadh, Saudi Arabia');
    setStartDate('2026-10-01');
    setEndDate('2027-06-30');
    setProjectManager('Eng. Khalid Al-Otaibi');
    setStatus('active');
    setBudget(2500000);
    setNotes('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p);
    setCode(p.code);
    setName(p.name);
    setClient(p.client || '');
    setLocation(p.location);
    setStartDate(p.startDate);
    setEndDate(p.endDate || '');
    setProjectManager(p.projectManager);
    setStatus(p.status);
    setBudget(p.budget || 0);
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const projData: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      code,
      name,
      client,
      location,
      startDate,
      endDate: endDate || undefined,
      projectManager,
      status,
      budget,
      notes,
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString(),
    };

    if (editingProject) {
      updateProject(projData);
    } else {
      addProject(projData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            <span>Project Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Assign workforce rosters, manage site labor costing, track budgets and project direct expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="py-2 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((p) => {
          const assignedWorkers = workers.filter((w) => w.assignedProjectId === p.id);
          const projectExpenses = expenses.filter((e) => e.projectId === p.id);
          const totalExp = projectExpenses.reduce((s, e) => s + e.amount, 0);

          return (
            <div
              key={p.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between hover:border-emerald-500 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500">{p.code}</span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      p.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{p.name}</h3>
                {p.client && (
                  <div className="text-xs text-slate-500 mb-3">Client: {p.client}</div>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manager: {p.projectManager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {p.startDate} to {p.endDate || 'Ongoing'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-500">Assigned Crew:</span>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{assignedWorkers.length} Workers</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <span className="text-[10px] text-slate-500">Total Budget:</span>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                      {formatCurrency(p.budget || 0, currency, 0)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-500">
                  Site Expenses: {formatCurrency(totalExp, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Project Code *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Riyadh Metro Line 3 Extension"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Royal Commission for Riyadh City"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Project Manager
                  </label>
                  <input
                    type="text"
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Budget ({currency})
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

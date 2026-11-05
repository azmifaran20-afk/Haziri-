import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { ModeSelectModal } from './components/ModeSelectModal';
import { DashboardView } from './views/DashboardView';
import { AttendanceView } from './views/AttendanceView';
import { CalendarView } from './views/CalendarView';
import { WorkersView } from './views/WorkersView';
import { SalaryPayrollView } from './views/SalaryPayrollView';
import { OvertimeView } from './views/OvertimeView';
import { ExpensesView } from './views/ExpensesView';
import { AdvancesPaymentsView } from './views/AdvancesPaymentsView';
import { ReportsView } from './views/ReportsView';
import { ProjectsView } from './views/ProjectsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { mode } = useApp();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // If in Individual mode and user was on a company-only tab, revert to dashboard
  useEffect(() => {
    if (mode === 'individual' && (currentTab === 'workers' || currentTab === 'projects')) {
      setCurrentTab('dashboard');
    }
  }, [mode, currentTab]);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Mode selection modal */}
      <ModeSelectModal />

      {/* Top Header */}
      <Header onOpenMobileNav={() => setIsMobileNavOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full overflow-hidden">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'attendance' && <AttendanceView />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'workers' && <WorkersView />}
          {currentTab === 'payroll' && <SalaryPayrollView />}
          {currentTab === 'overtime' && <OvertimeView />}
          {currentTab === 'expenses' && <ExpensesView />}
          {currentTab === 'advances' && <AdvancesPaymentsView />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'projects' && <ProjectsView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

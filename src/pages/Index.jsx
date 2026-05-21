import React, { useState, useMemo, useEffect } from 'react';
import { useJobApplications } from '@/hooks/useJobApplications';
import { AppHeader, VIEW_MODES } from '@/components/layout/AppHeader';
import { JobKanban } from '@/components/kanban/JobKanban';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import AIResumeOptimizer from '@/pages/AIResumeOptimizer';
import KanbanSkeleton from '@/components/kanban/KanbanSkeleton';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

var Index = function() {
  var _a = useState(VIEW_MODES.KANBAN), currentView = _a[0], setCurrentView = _a[1];
  var _b = useState(false), isDark = _b[0], setIsDark = _b[1];
  var _c = useState(null), filteredApps = _c[0], setFilteredApps = _c[1];
  var _d = useState(true), isLoadingKanban = _d[0], setIsLoadingKanban = _d[1];

  var _e = useJobApplications(), applications = _e.applications, allApplications = _e.allApplications, isLoading = _e.isLoading, addApplication = _e.addApplication, updateApplication = _e.updateApplication, deleteApplication = _e.deleteApplication, archiveApplication = _e.archiveApplication, batchDeleteApplications = _e.batchDeleteApplications, batchMoveApplications = _e.batchMoveApplications, moveApplication = _e.moveApplication, toggleMaterial = _e.toggleMaterial, getStats = _e.getStats, exportToCSV = _e.exportToCSV, exportToICS = _e.exportToICS;

  var stats = useMemo(function() { return getStats(allApplications); }, [getStats, allApplications]);

  useEffect(function() {
    var savedMode = localStorage.getItem('job-tracker-dark-mode');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initialDark = savedMode ? savedMode === 'true' : prefersDark;
    setIsDark(initialDark);
    if (initialDark) { document.documentElement.classList.add('dark'); }
  }, []);

  function toggleDarkMode() {
    var newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('job-tracker-dark-mode', String(newIsDark));
    if (newIsDark) { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
  }

  function handleViewCalendar() { setCurrentView(VIEW_MODES.CALENDAR); }

  function handleExportCSV() {
    var appsToExport = filteredApps || applications;
    exportToCSV(appsToExport);
    toast.success('已导出 ' + appsToExport.length + ' 条申请数据');
  }

  useEffect(function() {
    var timer = setTimeout(function() { setIsLoadingKanban(false); }, 500);
    return function() { clearTimeout(timer); };
  }, []);

  function renderContent() {
    if (currentView === VIEW_MODES.AI_RESUME) return React.createElement(AIResumeOptimizer);
    if ((isLoading || isLoadingKanban) && currentView === VIEW_MODES.KANBAN) return React.createElement(KanbanSkeleton);
    switch (currentView) {
      case VIEW_MODES.KANBAN:
        return React.createElement(JobKanban, {
          applications: applications,
          onAddJob: addApplication,
          onUpdateJob: updateApplication,
          onDeleteJob: deleteApplication,
          onArchiveJob: archiveApplication,
          onMoveJob: moveApplication,
          onToggleMaterial: toggleMaterial,
          onBatchDelete: batchDeleteApplications,
          onBatchMove: batchMoveApplications,
          onExportICS: exportToICS,
          onFilterChange: setFilteredApps
        });
      case VIEW_MODES.CALENDAR:
        return React.createElement(CalendarView, {
          applications: applications,
          onAddJob: addApplication,
          onUpdateJob: updateApplication,
          onExportICS: exportToICS
        });
      case VIEW_MODES.STATS:
        return React.createElement(StatsDashboard, {
          stats: stats,
          onExportCSV: handleExportCSV,
          onViewCalendar: handleViewCalendar
        });
      default:
        return null;
    }
  }

  return React.createElement('div', { className: 'min-h-screen bg-gray-50 dark:bg-gray-950' },
    React.createElement(AppHeader, {
      currentView: currentView,
      onChangeView: setCurrentView,
      stats: stats,
      isDark: isDark,
      onToggleDarkMode: toggleDarkMode
    }),
    React.createElement('main', { className: 'h-[calc(100vh-56px)] p-2 sm:p-4 overflow-hidden' },
      renderContent()
    ),
    React.createElement(Toaster)
  );
};

export default Index;
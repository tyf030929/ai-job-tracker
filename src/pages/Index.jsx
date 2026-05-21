import React, { useState, useMemo, useEffect } from 'react';
import { useJobApplications } from '@/hooks/useJobApplications';
import { AppHeader, VIEW_MODES } from '@/components/layout/AppHeader';
import { JobKanban } from '@/components/kanban/JobKanban';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import AIResumeOptimizer from '@/pages/AIResumeOptimizer';
import { KanbanSkeleton } from '@/components/kanban/KanbanSkeleton';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const Index = () => {
  const [currentView, setCurrentView] = useState(VIEW_MODES.KANBAN);
  const [isDark, setIsDark] = useState(false);
  const [filteredApps, setFilteredApps] = useState(null);
  const [isLoadingKanban, setIsLoadingKanban] = useState(true);
  
  const {
    applications,
    allApplications,
    isLoading,
    addApplication,
    updateApplication,
    deleteApplication,
    archiveApplication,
    batchDeleteApplications,
    batchMoveApplications,
    moveApplication,
    toggleMaterial,
    getStats,
    exportToCSV,
    exportToICS,
  } = useJobApplications();

  // 使用 allApplications 确保统计包含所有数据（包括已归档）
  const stats = useMemo(() => getStats(allApplications), [getStats, allApplications]);

  // 初始化暗黑模式
  useEffect(() => {
    const savedMode = localStorage.getItem('job-tracker-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedMode ? savedMode === 'true' : prefersDark;
    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 切换暗黑模式
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('job-tracker-dark-mode', String(newIsDark));
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 处理跳转到日历视图
  const handleViewCalendar = () => {
    setCurrentView(VIEW_MODES.CALENDAR);
  };

  // 导出CSV - 支持当前过滤条件
  const handleExportCSV = () => {
    const appsToExport = filteredApps || applications;
    exportToCSV(appsToExport);
    toast.success(`已导出 ${appsToExport.length} 条申请数据`);
  };

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingKanban(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    // AI 简历优化页面使用独立布局
    if (currentView === VIEW_MODES.AI_RESUME) {
      return <AIResumeOptimizer />;
    }

    if ((isLoading || isLoadingKanban) && currentView === VIEW_MODES.KANBAN) {
      return <KanbanSkeleton />;
    }

    switch (currentView) {
      case VIEW_MODES.KANBAN:
        return (
          <JobKanban
            applications={applications}
            onAddJob={addApplication}
            onUpdateJob={updateApplication}
            onDeleteJob={deleteApplication}
            onArchiveJob={archiveApplication}
            onMoveJob={moveApplication}
            onToggleMaterial={toggleMaterial}
            onBatchDelete={batchDeleteApplications}
            onBatchMove={batchMoveApplications}
            onExportICS={exportToICS}
            onFilterChange={setFilteredApps}
          />
        );
      case VIEW_MODES.CALENDAR:
        return (
          <CalendarView
            applications={applications}
            onAddJob={addApplication}
            onUpdateJob={updateApplication}
            onExportICS={exportToICS}
          />
        );
      case VIEW_MODES.STATS:
        return (
          <StatsDashboard 
            stats={stats} 
            onExportCSV={handleExportCSV}
            onViewCalendar={handleViewCalendar}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppHeader 
        currentView={currentView} 
        onChangeView={setCurrentView}
        stats={stats}
        isDark={isDark}
        onToggleDarkMode={toggleDarkMode}
      />
      <main className="h-[calc(100vh-56px)] p-2 sm:p-4 overflow-hidden">
        {renderContent()}
      </main>
      <Toaster />
    </div>
  );
};

export default Index;

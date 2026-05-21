import React from 'react';
import { Briefcase, LayoutDashboard, CalendarDays, BarChart3, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const VIEW_MODES = {
  KANBAN: 'kanban',
  CALENDAR: 'calendar',
  STATS: 'stats',
  AI_RESUME: 'ai_resume',
};

export const AppHeader = ({ currentView, onChangeView, stats, isDark, onToggleDarkMode }) => {
  const navItems = [
    { id: VIEW_MODES.KANBAN, label: '看板', icon: LayoutDashboard },
    { id: VIEW_MODES.CALENDAR, label: '日历', icon: CalendarDays },
    { id: VIEW_MODES.STATS, label: '统计', icon: BarChart3 },
    { id: VIEW_MODES.AI_RESUME, label: 'AI简历', icon: Sparkles },
  ];

  return (
    <header className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between h-14 px-2 sm:px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg leading-tight dark:text-white">求职管理</h1>
            <p className="text-[10px] text-muted-foreground dark:text-gray-400">Job Tracker v5</p>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="gap-1.5"
                onClick={() => onChangeView(item.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.id === VIEW_MODES.KANBAN && stats?.thisWeekDue > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                    {stats.thisWeekDue}
                  </Badge>
                )}
              </Button>
            );
          })}
          
          {/* 暗黑模式切换 - 使用白色/浅色图标确保在深色背景下可见 */}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 dark:text-gray-200 hover:dark:bg-gray-800"
            onClick={onToggleDarkMode}
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

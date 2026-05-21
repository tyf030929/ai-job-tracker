import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Moon,
  Sun,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const VIEW_MODES = {
  KANBAN: 'kanban',
  CALENDAR: 'calendar',
  STATS: 'stats',
  AI_RESUME: 'ai_resume',
};

const AppHeader = ({ currentView, onChangeView, stats, isDark, onToggleDarkMode }) => {
  const navItems = [
    {
      id: VIEW_MODES.KANBAN,
      label: '看板',
      icon: LayoutDashboard,
      badge: stats?.total || null,
    },
    {
      id: VIEW_MODES.CALENDAR,
      label: '日历',
      icon: CalendarDays,
    },
    {
      id: VIEW_MODES.STATS,
      label: '统计',
      icon: BarChart3,
    },
    {
      id: VIEW_MODES.AI_RESUME,
      label: 'AI简历',
      icon: Sparkles,
    },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">
                求职看板
              </h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">
                记录每一份申请
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeView(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge != null && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleDarkMode}
              className="h-8 w-8"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-gray-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { AppHeader };
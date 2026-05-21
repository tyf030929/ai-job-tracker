import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddJobDialog } from '@/components/kanban/AddJobDialog';
import { STAGE_OPTIONS, getStageLabel, isCompletedStage } from '@/constants/jobStages';

const CalendarView = ({ applications, onAddJob, onUpdateJob, onExportICS }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Group applications by date
  const appsByDate = useMemo(() => {
    const map = {};
    applications.forEach((app) => {
      if (!app.deadline || isCompletedStage(app.stage)) return;
      const dateKey = app.deadline;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(app);
    });
    return map;
  }, [applications]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  // Get stage color
  const getStageColor = (stage) => {
    const stageColors = {
      submitted: 'bg-blue-500',
      written: 'bg-yellow-500',
      interview_1: 'bg-purple-500',
      interview_2: 'bg-purple-600',
      interview_hr: 'bg-pink-500',
      offer: 'bg-green-500',
      rejected: 'bg-gray-500',
      withdrawn: 'bg-slate-400',
    };
    return stageColors[stage] || 'bg-gray-400';
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const selectedDateApps = selectedDate
    ? appsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'yyyy 年 MM 月', { locale: zhCN })}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
              今天
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
            setAddDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          添加申请
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayApps = appsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, parseISO(selectedDate));

            return (
              <div
                key={idx}
                onClick={() => setSelectedDate(dateKey)}
                className={`
                  min-h-[80px] rounded-lg border p-2 cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
                  ${isToday ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}
                  ${isSelected ? 'ring-2 ring-blue-400' : ''}
                  hover:border-blue-300 dark:hover:border-blue-600
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-500 text-white' : ''}
                      ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayApps.length > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                      {dayApps.length}
                    </Badge>
                  )}
                </div>

                {/* Applications on this day */}
                <div className="space-y-1">
                  {dayApps.slice(0, 2).map((app) => (
                    <div
                      key={app.id}
                      className={`text-[10px] px-1 py-0.5 rounded truncate text-white ${getStageColor(app.stage)}`}
                      title={`${app.companyName} - ${app.position}`}
                    >
                      {app.companyName}
                    </div>
                  ))}
                  {dayApps.length > 2 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                      +{dayApps.length - 2} 更多
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected date detail panel */}
      {selectedDate && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">
              {format(parseISO(selectedDate), 'yyyy 年 MM 月 dd 日', { locale: zhCN })}
              {' '}
              <span className="text-gray-400">
                ({selectedDateApps.length} 项申请)
              </span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddDialogOpen(true);
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              添加
            </Button>
          </div>

          {selectedDateApps.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-4">
              这一天没有申请
            </p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {selectedDateApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                >
                  <div className={`w-1 h-10 rounded-full ${getStageColor(app.stage)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {app.companyName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {app.position}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {getStageLabel(app.stage)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Job Dialog */}
      <AddJobDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialStage="submitted"
        onAdd={(jobData) => {
          onAddJob(jobData);
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
};

export { CalendarView };
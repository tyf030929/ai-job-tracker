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
  differenceInDays,
  startOfDay,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn,
  addMonths,
  subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddJobDialog } from '@/components/kanban/AddJobDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CalendarView = ({ applications, onAddJob, onUpdateJob, onExportICS }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('deadline'); // 'deadline' | 'interview'
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week'
  const [selectedDate, setSelectedDate] = useState(null);

  // 根据视图模式计算日期范围
  const dateRange = useMemo(() => {
    if (calendarView === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);
      return { start: calendarStart, end: calendarEnd };
    } else {
      // 周视图
      const weekStart = startOfWeekFn(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeekFn(currentDate, { weekStartsOn: 1 });
      return { start: weekStart, end: weekEnd };
    }
  }, [currentDate, calendarView]);

  // 生成日历格子
  const calendarDays = useMemo(() => {
    const days = [];
    let day = dateRange.start;
    while (day <= dateRange.end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [dateRange]);

  // 按日期分组申请 - 根据视图模式决定使用截止日期还是面试时间
  const applicationsByDate = useMemo(() => {
    const grouped = {};
    applications.forEach(app => {
      // 简化处理：使用截止日期作为主要日期
      const dateKey = app.deadline;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(app);
    });
    return grouped;
  }, [applications]);

  // 定义上一个周期函数
  const prevPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };
  
  // 定义下一个周期函数
  const nextPeriod = () => {
    if (calendarView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 获取日期状态颜色
  const getDayStatusColor = (day, dayApps) => {
    const today = startOfDay(new Date());
    const daysUntil = differenceInDays(day, today);
    
    if (dayApps.length === 0) return null;
    
    if (viewMode === 'deadline') {
      // 截止日期视图
      const hasExpired = dayApps.some(app => {
        if (['rejected', 'withdrawn', 'offer'].includes(app.stage)) return false;
        return daysUntil < 0;
      });
      const hasUrgent = dayApps.some(app => {
        if (['rejected', 'withdrawn', 'offer'].includes(app.stage)) return false;
        return daysUntil >= 0 && daysUntil <= 3;
      });
      const hasWarning = dayApps.some(app => {
        if (['rejected', 'withdrawn', 'offer'].includes(app.stage)) return false;
        return daysUntil > 3 && daysUntil <= 7;
      });
      const hasOffer = dayApps.some(app => app.stage === 'offer');
      
      if (hasExpired) return 'bg-red-500';
      if (hasUrgent) return 'bg-red-500';
      if (hasWarning) return 'bg-yellow-500';
      if (hasOffer) return 'bg-green-500';
      return 'bg-blue-500';
    } else {
      // 面试日期视图（简化处理）
      return 'bg-purple-500';
    }
  };

  // 处理日期点击 - 打开新建申请对话框
  const handleDateClick = (day) => {
    setSelectedDate(day);
    setIsAddDialogOpen(true);
  };

  // 处理添加申请
  const handleAddJob = (defaultStage) => {
    const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(addDays(new Date(), 14), 'yyyy-MM-dd');
    onAddJob({
      companyName: '',
      position: '',
      deadline: dateStr,
      stage: defaultStage || 'submitted',
      progressStatus: 'normal',
      salary: 0,
      location: '',
      channel: '官网',
      link: '',
      notes: '',
      materials: [{ id: `m${Date.now()}`, name: '简历PDF', completed: false }],
    });
    setIsAddDialogOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold dark:text-white">
            {format(currentDate, calendarView === 'month' ? 'yyyy年 MM月' : 'yyyy年 MM月 第w周', { locale: zhCN })}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={prevPeriod}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={nextPeriod}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 月/周视图切换 */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
            <Button
              size="sm"
              variant={calendarView === 'month' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setCalendarView('month')}
            >
              <Grid3X3 className="h-3 w-3 mr-1" />
              月
            </Button>
            <Button
              size="sm"
              variant={calendarView === 'week' ? 'default' : 'ghost'}
              className="h-7 px-2 text-xs"
              onClick={() => setCalendarView('week')}
            >
              <List className="h-3 w-3 mr-1" />
              周
            </Button>
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
            <TabsList className="h-8 dark:bg-gray-800">
              <TabsTrigger value="deadline" className="text-xs px-3 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                <CalendarIcon className="h-3 w-3 mr-1" />
                截止日
              </TabsTrigger>
              <TabsTrigger value="interview" className="text-xs px-3 dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                <Clock className="h-3 w-3 mr-1" />
                面试
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            新增
          </Button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center py-2 font-medium text-sm text-muted-foreground dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className={`grid grid-cols-7 gap-1 flex-1 ${calendarView === 'week' ? 'grid-rows-1' : 'auto-rows-fr'}`}>
        {calendarDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayApps = applicationsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const daysUntil = differenceInDays(day, new Date());
          
          const statusColor = getDayStatusColor(day, dayApps);
          const isUrgent = statusColor === 'bg-red-500';
          const isWarning = statusColor === 'bg-yellow-500';

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`min-h-[80px] sm:min-h-[100px] p-1 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/30'
              } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                isUrgent ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                isWarning ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : 
                  isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {format(day, 'd')}
                </span>
                {statusColor && (
                  <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                )}
              </div>
              
              <div className="space-y-1">
                {dayApps.slice(0, 2).map((app) => (
                  <div
                    key={app.id}
                    className={`text-[10px] p-1 rounded truncate ${
                      app.stage === 'rejected' || app.stage === 'withdrawn' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400' :
                      app.stage === 'offer' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                      isUrgent ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' :
                      isWarning ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {app.companyName}
                  </div>
                ))}
                {dayApps.length > 2 && (
                  <div className="text-[10px] text-muted-foreground dark:text-gray-500 text-center">
                    +{dayApps.length - 2} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center gap-3 mt-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <span className="dark:text-gray-300">进行中</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
          <span className="dark:text-gray-300">已录用</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
          <span className="dark:text-gray-300">7天内到期</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
          <span className="dark:text-gray-300">紧急/已过期</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
          <span className="dark:text-gray-300">已结束</span>
        </div>
      </div>

      <AddJobDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddJob}
      />
    </div>
  );
};

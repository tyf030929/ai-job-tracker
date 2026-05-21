import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Download,
  AlertCircle,
  Percent,
  Timer,
  Wallet,
  CalendarClock,
  Hourglass,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { STAGE_OPTIONS, getStageLabel } from '@/constants/jobStages';

const StatsDashboard = ({ stats, onExportCSV, onViewCalendar }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  const {
    total,
    submitted,
    written,
    interview,
    offer,
    rejected,
    thisWeekDue,
    todayDue,
    channelStats,
    materialProgress,
    offerRate,
    stageDurations,
    salaryRanges,
    avgProcessingDays,
  } = stats;

  // Pie chart data for stage distribution
  const stageData = [
    { name: '已投递', value: submitted, color: '#3b82f6' },
    { name: '笔试/测评', value: written, color: '#eab308' },
    { name: '面试中', value: interview, color: '#8b5cf6' },
    { name: 'Offer', value: offer, color: '#22c55e' },
    { name: '已拒绝', value: rejected, color: '#6b7280' },
  ].filter((d) => d.value > 0);

  // Channel data
  const channelData = Object.entries(channelStats || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Salary ranges data
  const salaryData = [
    { name: '15k以下', value: salaryRanges?.['15k以下'] || 0 },
    { name: '15-25k', value: salaryRanges?.['15-25k'] || 0 },
    { name: '25-35k', value: salaryRanges?.['25-35k'] || 0 },
    { name: '35k以上', value: salaryRanges?.['35k以上'] || 0 },
  ];

  const statCards = [
    {
      label: '总申请数',
      value: total,
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: '本周到期',
      value: thisWeekDue,
      icon: CalendarClock,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30',
    },
    {
      label: '今日到期',
      value: todayDue,
      icon: AlertCircle,
      color: todayDue > 0 ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 'text-gray-600 bg-gray-50 dark:bg-gray-800',
    },
    {
      label: 'Offer数',
      value: offer,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Offer率',
      value: `${offerRate}%`,
      icon: Percent,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
    },
    {
      label: '材料完成',
      value: `${materialProgress}%`,
      icon: Target,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">数据统计</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">求职申请数据分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewCalendar}>
            <CalendarClock className="h-4 w-4 mr-1" />
            日历视图
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            导出CSV
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${card.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stage distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">申请阶段分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              {stageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400">暂无数据</p>
              )}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2">
              {stageData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel distribution bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">申请渠道分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {channelData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salary distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">薪资分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Processing time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">处理时长</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                    <Timer className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgProcessingDays}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">天平均处理时长</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  基于已完成的申请记录计算
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { StatsDashboard };
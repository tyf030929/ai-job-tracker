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
  Hourglass
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
} from 'recharts';
import { STAGE_OPTIONS, getStageLabel } from '@/constants/jobStages';

const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#ec4899', '#22c55e', '#6b7280', '#94a3b8', '#f97316'];

export const StatsDashboard = ({ stats, onExportCSV, onViewCalendar }) => {
  const stageData = [
    { name: '已投递', value: stats.submitted, color: COLORS[0] },
    { name: '笔试/测评', value: stats.written, color: COLORS[1] },
    { name: '面试中', value: stats.interview, color: COLORS[2] },
    { name: '发放Offer', value: stats.offer, color: COLORS[4] },
    { name: '已拒绝', value: stats.rejected, color: COLORS[5] },
    { name: '已撤回', value: stats.withdrawn, color: COLORS[6] },
  ].filter(d => d.value > 0);

  const channelData = Object.entries(stats.channelStats || {}).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // 渠道转化漏斗数据
  const funnelData = [
    { name: '已投递', value: stats.total },
    { name: '笔试', value: stats.written + stats.interview + stats.offer },
    { name: '面试', value: stats.interview + stats.offer },
    { name: 'Offer', value: stats.offer },
  ];

  // 薪资分布数据
  const salaryData = Object.entries(stats.salaryRanges || {}).map(([name, value]) => ({
    name,
    value
  }));

  // 阶段停留天数
  const durationData = Object.entries(stats.stageDurations || {}).map(([stage, days]) => ({
    name: getStageLabel(stage),
    days
  }));

  return (
    <div className="space-y-6 overflow-y-auto h-full">
      {/* 操作栏 */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          导出CSV
        </Button>
      </div>

      {/* 关键指标 - 第一行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewCalendar}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">总申请数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              所有申请记录
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewCalendar}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">面试中</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.interview}</div>
            <p className="text-xs text-muted-foreground">
              需要准备面试
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewCalendar}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Offer率
              <Percent className="h-3 w-3" />
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.offerRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.offer} 个Offer / {stats.total} 个申请
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            stats.thisWeekDue > 0 ? 'ring-2 ring-red-200 dark:ring-red-900' : ''
          }`} 
          onClick={onViewCalendar}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              本周到期
              {stats.todayDue > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs bg-red-500 text-white rounded-full">
                  {stats.todayDue}
                </span>
              )}
            </CardTitle>
            <Clock className={`h-4 w-4 ${stats.thisWeekDue > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.thisWeekDue > 0 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
              {stats.thisWeekDue}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stats.todayDue > 0 ? (
                <>
                  <AlertCircle className="h-3 w-3 text-red-500" />
                  今天有 {stats.todayDue} 个截止
                </>
              ) : '自然周（周一至周日）'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 时间管理指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              平均处理时长
            </CardTitle>
            <Hourglass className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgProcessingDays} 天</div>
            <p className="text-xs text-muted-foreground">
              截止日距创建日平均
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              最长处理时间
            </CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maxProcessingDays} 天</div>
            <p className="text-xs text-muted-foreground">
              单申请最长期限
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日到期</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.todayDue > 0 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
              {stats.todayDue}
            </div>
            <p className="text-xs text-muted-foreground">
              今日截止申请
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">材料完成度</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.materialProgress}%</div>
            <p className="text-xs text-muted-foreground">
              所有申请材料进度
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 阶段分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              申请阶段分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {stageData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded" style={{ background: item.color }} />
                  <span className="dark:text-gray-300">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 渠道分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              申请渠道排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                暂无数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 转化漏斗 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            渠道转化漏斗
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 阶段停留天数 */}
      {durationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4" />
              各阶段平均停留天数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="days" fill="#f59e0b" radius={[4, 4, 0, 0]} name="天数" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 薪资分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            薪资分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

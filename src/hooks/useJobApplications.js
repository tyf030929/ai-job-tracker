import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays, startOfWeek, endOfWeek, parseISO, differenceInDays, isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'job-tracker-applications-v4';

// 生成示例数据 - 满足 v4 要求
const generateSampleData = () => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
  const threeDaysStr = format(addDays(today, 3), 'yyyy-MM-dd');
  const sevenDaysStr = format(addDays(today, 7), 'yyyy-MM-dd');
  const fourteenDaysStr = format(addDays(today, 14), 'yyyy-MM-dd');
  const past2DaysStr = format(subDays(today, 2), 'yyyy-MM-dd');
  const past5DaysStr = format(subDays(today, 5), 'yyyy-MM-dd');
  const past3DaysStr = format(subDays(today, 3), 'yyyy-MM-dd');

  return [
    {
      id: '1',
      companyName: '字节跳动',
      position: '前端开发工程师',
      deadline: tomorrowStr,
      stage: 'interview_2',
      progressStatus: 'urgent',
      salary: 25000,
      location: '北京',
      channel: '内推',
      link: 'https://jobs.bytedance.com',
      materials: [
        { id: 'm1', name: '简历PDF', completed: true },
        { id: 'm2', name: '面试准备笔记', completed: false },
      ],
      notes: '二面需要准备算法题',
      timeline: [
        { date: format(subDays(today, 10), 'yyyy-MM-dd'), stage: 'submitted', note: '投递申请' },
        { date: format(subDays(today, 3), 'yyyy-MM-dd'), stage: 'interview_1', note: '完成一面' },
        { date: format(subDays(today, 1), 'yyyy-MM-dd'), stage: 'interview_2', note: '进入二面' },
      ],
      createdAt: format(subDays(today, 10), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 1), 'yyyy-MM-dd'),
    },
    {
      id: '2',
      companyName: '阿里巴巴',
      position: 'React开发工程师',
      deadline: threeDaysStr,
      stage: 'interview_1',
      progressStatus: 'pending',
      salary: 28000,
      location: '杭州',
      channel: '官网',
      link: 'https://talent.alibaba.com',
      materials: [
        { id: 'm5', name: '简历PDF', completed: true },
        { id: 'm6', name: '求职信', completed: false },
      ],
      notes: '需要准备React原理',
      timeline: [
        { date: format(subDays(today, 8), 'yyyy-MM-dd'), stage: 'submitted', note: '官网投递' },
        { date: format(subDays(today, 2), 'yyyy-MM-dd'), stage: 'interview_1', note: '安排一面' },
      ],
      createdAt: format(subDays(today, 8), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 2), 'yyyy-MM-dd'),
    },
    {
      id: '3',
      companyName: '腾讯',
      position: '高级前端工程师',
      deadline: sevenDaysStr,
      stage: 'written',
      progressStatus: 'normal',
      salary: 30000,
      location: '深圳',
      channel: 'Boss直聘',
      link: 'https://careers.tencent.com',
      materials: [
        { id: 'm8', name: '简历PDF', completed: true },
      ],
      notes: '',
      timeline: [
        { date: format(subDays(today, 5), 'yyyy-MM-dd'), stage: 'submitted', note: '投递申请' },
        { date: format(subDays(today, 2), 'yyyy-MM-dd'), stage: 'written', note: '收到笔试' },
      ],
      createdAt: format(subDays(today, 5), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 2), 'yyyy-MM-dd'),
    },
    {
      id: '4',
      companyName: '美团',
      position: '前端开发实习生',
      deadline: past2DaysStr,
      stage: 'rejected',
      progressStatus: 'normal',
      salary: 8000,
      location: '北京',
      channel: '猎聘',
      link: '',
      materials: [
        { id: 'm10', name: '简历PDF', completed: true },
      ],
      notes: '已收到拒信',
      timeline: [
        { date: format(subDays(today, 15), 'yyyy-MM-dd'), stage: 'submitted', note: '投递' },
        { date: past2DaysStr, stage: 'rejected', note: '收到拒信' },
      ],
      createdAt: format(subDays(today, 15), 'yyyy-MM-dd'),
      updatedAt: past2DaysStr,
    },
    {
      id: '5',
      companyName: '小红书',
      position: '前端工程师',
      deadline: past5DaysStr,
      stage: 'rejected',
      progressStatus: 'normal',
      salary: 22000,
      location: '上海',
      channel: '实习僧',
      link: 'https://www.xiaohongshu.com/join',
      materials: [
        { id: 'm12', name: '简历PDF', completed: true },
      ],
      notes: '未通过简历筛选',
      timeline: [
        { date: format(subDays(today, 10), 'yyyy-MM-dd'), stage: 'submitted', note: '投递' },
        { date: past5DaysStr, stage: 'rejected', note: '简历未通过' },
      ],
      createdAt: format(subDays(today, 10), 'yyyy-MM-dd'),
      updatedAt: past5DaysStr,
    },
    {
      id: '6',
      companyName: '京东',
      position: 'Web前端开发',
      deadline: todayStr,
      stage: 'interview_hr',
      progressStatus: 'urgent',
      salary: 26000,
      location: '北京',
      channel: '智联招聘',
      link: 'https://zhaopin.jd.com',
      materials: [
        { id: 'm14', name: '简历PDF', completed: true },
        { id: 'm15', name: '薪资期望表', completed: false },
      ],
      notes: 'HR面需准备薪资谈判',
      timeline: [
        { date: format(subDays(today, 12), 'yyyy-MM-dd'), stage: 'submitted', note: '投递' },
        { date: format(subDays(today, 3), 'yyyy-MM-dd'), stage: 'interview_2', note: '完成二面' },
        { date: format(subDays(today, 1), 'yyyy-MM-dd'), stage: 'interview_hr', note: '进入HR面' },
      ],
      createdAt: format(subDays(today, 12), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 1), 'yyyy-MM-dd'),
    },
    {
      id: '7',
      companyName: '网易',
      position: '高级前端开发',
      deadline: format(addDays(today, 30), 'yyyy-MM-dd'),
      stage: 'offer',
      progressStatus: 'normal',
      salary: 32000,
      location: '杭州',
      channel: '脉脉',
      link: 'https://hr.163.com',
      materials: [
        { id: 'm17', name: '简历PDF', completed: true },
        { id: 'm18', name: '学历证明', completed: true },
      ],
      notes: '已收到正式Offer，正在考虑',
      timeline: [
        { date: format(subDays(today, 20), 'yyyy-MM-dd'), stage: 'submitted', note: '投递' },
        { date: format(subDays(today, 10), 'yyyy-MM-dd'), stage: 'interview_hr', note: '完成HR面' },
        { date: format(subDays(today, 3), 'yyyy-MM-dd'), stage: 'offer', note: '收到Offer' },
      ],
      createdAt: format(subDays(today, 20), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 3), 'yyyy-MM-dd'),
    },
    {
      id: '8',
      companyName: '滴滴',
      position: '前端工程师',
      deadline: past3DaysStr,
      stage: 'withdrawn',
      progressStatus: 'normal',
      salary: 24000,
      location: '北京',
      channel: '前程无忧',
      link: '',
      materials: [
        { id: 'm21', name: '简历PDF', completed: true },
      ],
      notes: '已主动撤回申请',
      timeline: [
        { date: format(subDays(today, 15), 'yyyy-MM-dd'), stage: 'submitted', note: '投递' },
        { date: past3DaysStr, stage: 'withdrawn', note: '主动撤回' },
      ],
      createdAt: format(subDays(today, 15), 'yyyy-MM-dd'),
      updatedAt: past3DaysStr,
    },
    {
      id: '9',
      companyName: '拼多多',
      position: '前端开发',
      deadline: fourteenDaysStr,
      stage: 'submitted',
      progressStatus: 'normal',
      salary: 27000,
      location: '上海',
      channel: '官网',
      link: 'https://careers.pinduoduo.com',
      materials: [
        { id: 'm22', name: '简历PDF', completed: true },
        { id: 'm23', name: '求职信', completed: false },
      ],
      notes: '校招正式批',
      timeline: [
        { date: format(subDays(today, 3), 'yyyy-MM-dd'), stage: 'submitted', note: '官网投递' },
      ],
      createdAt: format(subDays(today, 3), 'yyyy-MM-dd'),
      updatedAt: format(subDays(today, 3), 'yyyy-MM-dd'),
    },
  ];
};

// 从本地存储读取数据
const getStoredApplications = () => {
  if (typeof window === 'undefined') return generateSampleData();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : generateSampleData();
};

// 保存到本地存储
const saveApplications = (apps) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
};

// 导出CSV
const exportToCSV = (applications) => {
  const headers = ['公司名称', '岗位名称', '当前阶段', '截止日期', '目标薪资', '工作地点', '申请渠道', '申请链接', '备注'];
  const rows = applications.map(app => [
    app.companyName,
    app.position,
    app.stage,
    app.deadline,
    app.salary,
    app.location,
    app.channel,
    app.link,
    app.notes,
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `求职申请_${format(new Date(), 'yyyyMMdd')}.csv`;
  link.click();
};

// 导出ICS日历文件
const exportToICS = (application, interviewDate) => {
  const formatDate = (date) => format(date, 'yyyyMMdd\'T\'HHmmss');
  const now = new Date();
  const dtStart = interviewDate || new Date();
  const dtEnd = new Date(dtStart.getTime() + 60 * 60 * 1000);
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobTracker//CN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(dtStart)}`,
    `DTEND:${formatDate(dtEnd)}`,
    `DTSTAMP:${formatDate(now)}`,
    `UID:${application.id}@jobtracker.local`,
    `SUMMARY:${application.companyName} - ${application.position} 面试`,
    `DESCRIPTION:申请岗位：${application.position}\\n公司：${application.companyName}\\n当前阶段：${application.stage}\\n备注：${application.notes || '无'}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `面试_${application.companyName}_${format(new Date(), 'yyyyMMdd')}.ics`;
  link.click();
};

// 计算各阶段平均停留天数
const calculateStageDurations = (applications) => {
  const stageStats = {};
  
  applications.forEach(app => {
    if (!app.timeline || app.timeline.length < 2) return;
    
    for (let i = 0; i < app.timeline.length - 1; i++) {
      const current = app.timeline[i];
      const next = app.timeline[i + 1];
      const days = Math.ceil((parseISO(next.date) - parseISO(current.date)) / (1000 * 60 * 60 * 24));
      
      if (!stageStats[current.stage]) {
        stageStats[current.stage] = { total: 0, count: 0 };
      }
      stageStats[current.stage].total += days;
      stageStats[current.stage].count += 1;
    }
  });
  
  const averages = {};
  Object.entries(stageStats).forEach(([stage, stats]) => {
    averages[stage] = Math.round(stats.total / stats.count);
  });
  
  return averages;
};

export const useJobApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['jobApplications'],
    queryFn: getStoredApplications,
  });

  const updateApplications = useCallback((newApps) => {
    saveApplications(newApps);
    queryClient.setQueryData(['jobApplications'], newApps);
  }, [queryClient]);

  const addApplication = useCallback((newApp) => {
    const now = new Date().toISOString();
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const apps = [...applications, { 
      ...newApp, 
      id: Date.now().toString(),
      timeline: [{ date: dateStr, stage: newApp.stage, note: '创建申请' }],
      createdAt: dateStr,
      updatedAt: now
    }];
    updateApplications(apps);
  }, [applications, updateApplications]);

  const updateApplication = useCallback((id, updates) => {
    const apps = applications.map(app => 
      app.id === id ? { ...app, ...updates, updatedAt: new Date().toISOString() } : app
    );
    updateApplications(apps);
  }, [applications, updateApplications]);

  const deleteApplication = useCallback((id) => {
    const apps = applications.filter(app => app.id !== id);
    updateApplications(apps);
  }, [applications, updateApplications]);

  const archiveApplication = useCallback((id) => {
    const apps = applications.map(app => 
      app.id === id ? { ...app, archived: true, updatedAt: new Date().toISOString() } : app
    );
    updateApplications(apps);
  }, [applications, updateApplications]);

  const batchDeleteApplications = useCallback((ids) => {
    const apps = applications.filter(app => !ids.includes(app.id));
    updateApplications(apps);
  }, [applications, updateApplications]);

  const batchMoveApplications = useCallback((ids, newStage) => {
    const now = new Date().toISOString();
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    
    const apps = applications.map(app => {
      if (!ids.includes(app.id)) return app;
      
      const newTimeline = [...(app.timeline || []), {
        date: dateStr,
        stage: newStage,
        note: `从 ${app.stage} 变更`
      }];
      
      return { 
        ...app, 
        stage: newStage, 
        timeline: newTimeline,
        updatedAt: now 
      };
    });
    updateApplications(apps);
  }, [applications, updateApplications]);

  const moveApplication = useCallback((id, newStage) => {
    const now = new Date().toISOString();
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    
    const apps = applications.map(app => {
      if (app.id !== id) return app;
      
      const newTimeline = [...(app.timeline || []), {
        date: dateStr,
        stage: newStage,
        note: `从 ${app.stage} 变更`
      }];
      
      return { 
        ...app, 
        stage: newStage, 
        timeline: newTimeline,
        updatedAt: now 
      };
    });
    updateApplications(apps);
  }, [applications, updateApplications]);

  const toggleMaterial = useCallback((appId, materialId) => {
    const apps = applications.map(app => {
      if (app.id !== appId) return app;
      return {
        ...app,
        materials: app.materials.map(m => 
          m.id === materialId ? { ...m, completed: !m.completed } : m
        ),
        updatedAt: new Date().toISOString(),
      };
    });
    updateApplications(apps);
  }, [applications, updateApplications]);

  const getStats = useCallback((apps = applications) => {
    // 活跃申请（未归档）
    const activeApps = apps.filter(a => !a.archived);
    const total = activeApps.length; // 使用活跃申请数作为总数（与看板一致）
    
    const submitted = activeApps.filter(a => a.stage === 'submitted').length;
    const written = activeApps.filter(a => a.stage === 'written').length;
    const interview = activeApps.filter(a => ['interview_1', 'interview_2', 'interview_hr'].includes(a.stage)).length;
    const offer = activeApps.filter(a => a.stage === 'offer').length;
    const rejected = activeApps.filter(a => a.stage === 'rejected').length;
    const withdrawn = activeApps.filter(a => a.stage === 'withdrawn').length;
    
    // 自然周计算（周一到周日）
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    const thisWeekDue = activeApps.filter(a => {
      const deadline = parseISO(a.deadline);
      return isWithinInterval(deadline, { start: weekStart, end: weekEnd }) && 
        !['rejected', 'withdrawn', 'offer'].includes(a.stage);
    }).length;

    // 今天到期
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayDue = activeApps.filter(a => {
      const deadline = parseISO(a.deadline);
      return isWithinInterval(deadline, { start: todayStart, end: todayEnd }) && 
        !['rejected', 'withdrawn', 'offer'].includes(a.stage);
    }).length;

    // 渠道统计
    const channelStats = activeApps.reduce((acc, app) => {
      acc[app.channel] = (acc[app.channel] || 0) + 1;
      return acc;
    }, {});

    // 材料完成度
    const totalMaterials = activeApps.reduce((sum, app) => sum + app.materials.length, 0);
    const completedMaterials = activeApps.reduce(
      (sum, app) => sum + app.materials.filter(m => m.completed).length, 0
    );

    // Offer率
    const offerRate = total > 0 ? Math.round((offer / total) * 100) : 0;
    
    // 各阶段平均停留天数
    const stageDurations = calculateStageDurations(activeApps);
    
    // 薪资分布
    const salaryRanges = {
      '15k以下': activeApps.filter(a => a.salary > 0 && a.salary < 15000).length,
      '15-25k': activeApps.filter(a => a.salary >= 15000 && a.salary < 25000).length,
      '25-35k': activeApps.filter(a => a.salary >= 25000 && a.salary < 35000).length,
      '35k以上': activeApps.filter(a => a.salary >= 35000).length,
    };

    // 计算处理时长（截止日期 - 创建日期）
    const processingDurations = activeApps.map(app => {
      try {
        // 获取创建日期（如果 createdAt 缺失，尝试使用 timeline 的第一条记录或 updatedAt）
        let createdAt = app.createdAt;
        if (!createdAt && app.timeline && app.timeline.length > 0) {
          createdAt = app.timeline[0].date;
        }
        if (!createdAt) {
          createdAt = app.updatedAt || format(new Date(), 'yyyy-MM-dd');
        }
        
        if (!app.deadline) return null;
        
        const createdStr = String(createdAt).trim();
        const deadlineStr = String(app.deadline).trim();
        
        if (!createdStr || !deadlineStr) return null;
        
        // 解析日期
        const created = parseISO(createdStr);
        const deadline = parseISO(deadlineStr);
        
        // 检查日期有效性
        if (isNaN(created.getTime()) || isNaN(deadline.getTime())) {
          return null;
        }
        
        const days = differenceInDays(deadline, created);
        return days >= 0 ? days : 0;
      } catch (e) {
        console.warn('计算处理时长失败:', app.id, e);
        return null;
      }
    }).filter(days => days !== null && !isNaN(days));

    const avgProcessingDays = processingDurations.length > 0 
      ? Math.round(processingDurations.reduce((a, b) => a + b, 0) / processingDurations.length)
      : 0;

    const maxProcessingDays = processingDurations.length > 0
      ? Math.max(...processingDurations)
      : 0;

    return {
      total,
      submitted,
      written,
      interview,
      offer,
      rejected,
      withdrawn,
      thisWeekDue,
      todayDue,
      channelStats,
      materialProgress: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
      offerRate,
      stageDurations,
      salaryRanges,
      avgProcessingDays,
      maxProcessingDays,
    };
  }, [applications]);

  return {
    applications: applications.filter(a => !a.archived),
    allApplications: applications,
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
    exportToCSV: (apps) => exportToCSV(apps || applications.filter(a => !a.archived)),
    exportToICS,
  };
};

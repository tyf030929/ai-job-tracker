// 申请阶段配置 - 8个完整阶段
export const JOB_STAGES = {
  submitted: { 
    id: 'submitted', 
    label: '已投递', 
    color: 'bg-blue-500',
    borderColor: 'border-blue-500',
  },
  written: { 
    id: 'written', 
    label: '笔试/测评', 
    color: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
  },
  interview_1: { 
    id: 'interview_1', 
    label: '一面', 
    color: 'bg-purple-500',
    borderColor: 'border-purple-500',
  },
  interview_2: { 
    id: 'interview_2', 
    label: '二面', 
    color: 'bg-purple-600',
    borderColor: 'border-purple-600',
  },
  interview_hr: { 
    id: 'interview_hr', 
    label: 'HR面', 
    color: 'bg-pink-500',
    borderColor: 'border-pink-500',
  },
  offer: { 
    id: 'offer', 
    label: '发放Offer', 
    color: 'bg-green-500',
    borderColor: 'border-green-500',
  },
  rejected: { 
    id: 'rejected', 
    label: '已拒绝', 
    color: 'bg-gray-500',
    borderColor: 'border-gray-500',
  },
  withdrawn: { 
    id: 'withdrawn', 
    label: '已撤回', 
    color: 'bg-slate-400',
    borderColor: 'border-slate-400',
  },
};

// 看板列配置 - 面试阶段合并为面试中列
export const KANBAN_COLUMNS = [
  { id: 'submitted', title: '已投递', stage: 'submitted' },
  { id: 'written', title: '笔试/测评', stage: 'written' },
  { id: 'interview', title: '面试中', stage: ['interview_1', 'interview_2', 'interview_hr'] },
  { id: 'offer', title: '发放Offer', stage: 'offer' },
  { id: 'rejected', title: '已结束', stage: ['rejected', 'withdrawn'] },
];

// 阶段选项（用于表单）- 完整8个阶段
export const STAGE_OPTIONS = [
  { value: 'submitted', label: '已投递' },
  { value: 'written', label: '笔试/测评' },
  { value: 'interview_1', label: '一面' },
  { value: 'interview_2', label: '二面' },
  { value: 'interview_hr', label: 'HR面' },
  { value: 'offer', label: '发放Offer' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'withdrawn', label: '已撤回' },
];

// 用于筛选的阶段选项（按求职流程顺序）
export const FILTER_STAGE_OPTIONS = [
  { value: 'all', label: '全部阶段' },
  { value: 'submitted', label: '已投递' },
  { value: 'written', label: '笔试/测评' },
  { value: 'interview_1', label: '一面' },
  { value: 'interview_2', label: '二面' },
  { value: 'interview_hr', label: 'HR面' },
  { value: 'interview_all', label: '面试中（全部）' },
  { value: 'offer', label: '发放Offer' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'withdrawn', label: '已撤回' },
];

// 进度状态
export const PROGRESS_STATUS = {
  normal: { label: '顺利', color: 'bg-green-500', borderColor: 'border-green-500' },
  pending: { label: '待处理', color: 'bg-yellow-500', borderColor: 'border-yellow-500' },
  urgent: { label: '紧急', color: 'bg-red-500', borderColor: 'border-red-500' },
};

// 申请渠道 - 完整列表
export const CHANNEL_OPTIONS = [
  { value: '内推', label: '内推' },
  { value: '官网', label: '官网' },
  { value: 'Boss直聘', label: 'Boss直聘' },
  { value: '猎聘', label: '猎聘' },
  { value: '智联招聘', label: '智联招聘' },
  { value: '前程无忧', label: '前程无忧' },
  { value: '实习僧', label: '实习僧' },
  { value: '脉脉', label: '脉脉' },
  { value: '其他', label: '其他' },
];

// 预定义材料清单
export const DEFAULT_MATERIALS = ['简历PDF', '求职信', '作品集链接', '笔试/测评链接', '面试准备笔记'];

// 获取阶段标签
export const getStageLabel = (stageValue) => {
  const option = STAGE_OPTIONS.find(opt => opt.value === stageValue);
  return option?.label || stageValue;
};

// 检查阶段是否属于某列
export const isStageInColumn = (stage, columnStage) => {
  if (Array.isArray(columnStage)) {
    return columnStage.includes(stage);
  }
  return stage === columnStage;
};

// 获取阶段排序索引
export const getStageOrder = (stageValue) => {
  const index = STAGE_OPTIONS.findIndex(opt => opt.value === stageValue);
  return index >= 0 ? index : 999;
};

// 获取申请紧急程度 - 修复版：正确处理日期差计算
// 使用正确的毫秒数：86400 * 1000 = 86,400,000 毫秒/天
export const getUrgencyLevel = (deadline, stage) => {
  const MS_PER_DAY = 86400 * 1000; // 86,400,000 毫秒 = 1 天
  
  // 解析截止日期（本地时间 00:00）
  const deadlineParts = deadline.split('-');
  const deadlineDate = new Date(
    parseInt(deadlineParts[0]), 
    parseInt(deadlineParts[1]) - 1, 
    parseInt(deadlineParts[2])
  );
  
  // 获取今天日期（本地时间 00:00）
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 计算毫秒差
  const diffMs = deadlineDate.getTime() - today.getTime();
  // 使用绝对值计算天数差，然后根据符号判断过期还是剩余
  const daysDiff = Math.ceil(Math.abs(diffMs) / MS_PER_DAY);
  const isExpired = diffMs < 0;
  
  // Offer状态特殊处理
  if (stage === 'offer') {
    if (isExpired) {
      return { 
        level: 'expired', 
        days: daysDiff, 
        label: `已过期 ${daysDiff} 天`, 
        color: 'red', 
        isOffer: true 
      };
    }
    return { 
      level: 'offer', 
      days: daysDiff, 
      label: `还剩 ${daysDiff} 天`, 
      color: 'green', 
      isOffer: true 
    };
  }
  
  // 已结束状态
  if (['rejected', 'withdrawn'].includes(stage)) {
    return { level: 'completed', days: daysDiff, label: '已结束', color: 'gray' };
  }
  
  // 统一倒计时格式
  if (isExpired) {
    return { 
      level: 'expired', 
      days: daysDiff, 
      label: `已过期 ${daysDiff} 天`, 
      color: 'red' 
    };
  }
  if (daysDiff === 0) {
    return { level: 'today', days: 0, label: '今天截止', color: 'red' };
  }
  if (daysDiff === 1) {
    return { level: 'tomorrow', days: 1, label: '明天截止', color: 'orange' };
  }
  if (daysDiff <= 3) {
    return { 
      level: 'urgent', 
      days: daysDiff, 
      label: `剩 ${daysDiff} 天`, 
      color: 'yellow' 
    };
  }
  if (daysDiff <= 7) {
    return { 
      level: 'warning', 
      days: daysDiff, 
      label: `剩 ${daysDiff} 天`, 
      color: 'yellow' 
    };
  }
  return { 
    level: 'normal', 
    days: daysDiff, 
    label: `剩 ${daysDiff} 天`, 
    color: 'normal' 
  };
};

// 检查是否是已结束状态
export const isCompletedStage = (stage) => {
  return ['rejected', 'withdrawn'].includes(stage);
};

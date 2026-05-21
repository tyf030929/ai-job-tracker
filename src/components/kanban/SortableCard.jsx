import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Calendar, MapPin, Briefcase, MoreHorizontal, ChevronDown, ChevronUp, ExternalLink, Archive, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PROGRESS_STATUS, getStageLabel, getUrgencyLevel, isCompletedStage } from '@/constants/jobStages';

export const SortableCard = ({ 
  application, 
  onUpdate, 
  onDelete, 
  onArchive,
  onToggleMaterial,
  onOpenDetail,
  isSelected,
  onSelect,
  selectionMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  // 计算所有需要的变量
  const completedMaterials = application.materials.filter(m => m.completed).length;
  const totalMaterials = application.materials.length;
  const materialProgress = totalMaterials > 0 ? (completedMaterials / totalMaterials) * 100 : 0;

  // 使用统一的紧急程度计算
  const urgency = getUrgencyLevel(application.deadline, application.stage);
  const isCompleted = isCompletedStage(application.stage);

  // 样式计算 - 已结束卡片降低视觉权重
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isCompleted ? 0.55 : 1,
  };
  
  // 边框颜色根据紧急程度，已结束卡片使用灰色背景
  let borderColorClass = '';
  let bgColorClass = '';
  if (isCompleted) {
    borderColorClass = 'border-l-4 border-l-gray-400';
    bgColorClass = 'bg-gray-100 dark:bg-gray-800/50';
  } else if (urgency.level === 'expired') {
    borderColorClass = 'border-l-4 border-l-red-500';
    bgColorClass = 'bg-red-50/50 dark:bg-red-900/10';
  } else if (urgency.level === 'today' || urgency.level === 'tomorrow') {
    borderColorClass = 'border-l-4 border-l-orange-500';
    bgColorClass = 'bg-orange-50/50 dark:bg-orange-900/10';
  } else if (urgency.level === 'urgent' || urgency.level === 'warning') {
    borderColorClass = 'border-l-4 border-l-yellow-500';
    bgColorClass = 'bg-yellow-50/50 dark:bg-yellow-900/10';
  }
  
  const statusConfig = PROGRESS_STATUS[application.progressStatus] || PROGRESS_STATUS.normal;

  // 处理公司名称点击 - 打开申请链接
  const handleCompanyClick = (e) => {
    e.stopPropagation();
    if (selectionMode) {
      onSelect(application.id);
      return;
    }
    if (application.link) {
      window.open(application.link, '_blank', 'noopener,noreferrer');
    } else {
      onOpenDetail(application);
    }
  };

  // 处理卡片点击 - 打开详情
  const handleCardClick = (e) => {
    if (selectionMode) {
      onSelect(application.id);
      return;
    }
    // 如果不是点击复选框或下拉菜单，则打开详情
    if (!e.target.closest('[data-no-open]')) {
      onOpenDetail(application);
    }
  };

  // 处理材料勾选
  const handleToggleMaterial = (e, materialId) => {
    e.stopPropagation();
    onToggleMaterial(application.id, materialId);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-pointer hover:shadow-md transition-all ${borderColorClass} ${bgColorClass} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={handleCardClick}
    >
      {/* 顶部状态条 */}
      <div className={`w-full h-1.5 ${statusConfig.color} rounded-t-lg`} />
      
      <CardHeader className="p-3 pb-0">
        <div className="flex items-start justify-between gap-2">
          {/* 选择模式复选框 - 使用真正的表单元素 */}
          {selectionMode && (
            <div data-no-open className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={() => onSelect(application.id)}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {/* 公司名称作为主点击区 */}
              <h4 
                className={`font-semibold text-sm truncate hover:text-blue-600 hover:underline cursor-pointer ${isCompleted ? 'text-gray-600 dark:text-gray-400' : 'dark:text-gray-100'}`}
                title={application.link ? '点击打开申请链接' : application.companyName}
                onClick={handleCompanyClick}
              >
                {application.companyName}
              </h4>
              {/* 链接图标只在有链接时显示 */}
              {application.link && !selectionMode && (
                <ExternalLink className="h-3 w-3 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className={`text-xs truncate ${isCompleted ? 'text-gray-500 dark:text-gray-500' : 'text-muted-foreground'}`} title={application.position}>
              {application.position}
            </p>
          </div>
          
          <div className="flex items-center gap-1" data-no-open>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpenDetail(application)}>
                  查看详情
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(application.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  归档申请
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(application.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除申请
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-2 space-y-2">
        {/* 阶段标签和地点 */}
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {getStageLabel(application.stage)}
          </Badge>
          {application.location && (
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />
              {application.location.split('/')[0]}
            </span>
          )}
        </div>

        {/* 截止日期 - 统一倒计时格式 */}
        <div 
          className={`flex items-center gap-1.5 text-xs ${
            urgency.level === 'expired' ? 'text-red-600 font-medium' : 
            urgency.level === 'today' || urgency.level === 'tomorrow' ? 'text-orange-600 font-medium' : 
            urgency.level === 'urgent' || urgency.level === 'warning' ? 'text-yellow-600' : 
            isCompleted ? 'text-gray-500' : 'text-muted-foreground'
          }`}
        >
          <Calendar className="h-3 w-3" />
          {/* 只显示一个倒计时 */}
          <span>
            {application.stage === 'offer' ? 'Offer有效期：' : ''}
            {urgency.label}
          </span>
          <span className="text-muted-foreground">
            ({format(parseISO(application.deadline), 'MM/dd', { locale: zhCN })})
          </span>
        </div>

        {/* 材料进度 - 已结束状态不显示 */}
        {!isCompleted && (
          <div className="space-y-1">
            <div 
              className="flex items-center justify-between text-xs cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <span className="text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                材料 {completedMaterials}/{totalMaterials}
              </span>
              <div className="flex items-center gap-1">
                <span className={materialProgress === 100 ? 'text-green-600' : 'text-muted-foreground'}>
                  {Math.round(materialProgress)}%
                </span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all ${materialProgress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${materialProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 展开的材料清单 */}
        {isExpanded && !isCompleted && (
          <div className="pt-1 space-y-1 border-t dark:border-gray-700" data-no-open>
            {application.materials.map((material) => (
              <div 
                key={material.id} 
                className="flex items-center gap-2 py-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={material.completed}
                  onCheckedChange={() => onToggleMaterial(application.id, material.id)}
                  className="h-3.5 w-3.5"
                />
                <span className={`text-xs flex-1 ${material.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {material.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
            {application.channel}
          </span>
          {/* 已结束卡片也显示薪资，没有薪资时显示 — */}
          <span className={`text-[10px] font-medium ${isCompleted ? 'text-gray-500' : 'text-green-600'}`}>
            {application.salary > 0 ? `¥${(application.salary / 1000).toFixed(0)}k` : '—'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

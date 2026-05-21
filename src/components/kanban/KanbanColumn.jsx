import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isStageInColumn, isCompletedStage } from '@/constants/jobStages';
import { SortableCard } from './SortableCard';

export const KanbanColumn = ({ 
  column, 
  applications, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onArchiveJob,
  onToggleMaterial,
  onOpenDetail,
  selectionMode,
  selectedIds,
  onToggleSelect
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // 过滤属于该列的申请 - 同时过滤掉不匹配的数据
  const columnApps = applications.filter(app => {
    // 首先检查阶段是否匹配该列
    const stageMatches = isStageInColumn(app.stage, column.stage);
    if (!stageMatches) return false;
    
    // 对于已结束列，只显示已拒绝和已撤回
    if (column.id === 'rejected') {
      return isCompletedStage(app.stage);
    }
    
    // 对于其他列，不显示已结束状态
    if (column.id !== 'rejected') {
      return !isCompletedStage(app.stage);
    }
    
    return true;
  });

  const handleSelect = (id) => {
    onToggleSelect(id);
  };

  // 获取该列的默认阶段（用于快速添加）
  const getDefaultStage = () => {
    if (Array.isArray(column.stage)) {
      return column.stage[0];
    }
    return column.stage;
  };

  const handleAddClick = () => {
    // 可以传递默认阶段给添加对话框
    onAddJob(getDefaultStage());
  };

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${isCollapsed ? 'w-12 min-w-[48px]' : 'min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[300px]'}`}>
      {/* 列标题 - 所有列都显示 + 按钮和折叠按钮 */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 overflow-hidden">
          {!isCollapsed && (
            <>
              <h3 className="font-semibold text-sm dark:text-white truncate">{column.title}</h3>
              <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0">
                {columnApps.length}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* 所有列都显示 + 按钮 */}
          {!isCollapsed && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={handleAddClick} title={`在${column.title}添加申请`}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
          {/* 所有列都显示折叠按钮 */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 flex-shrink-0" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? '展开列' : '折叠列'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 折叠状态显示 */}
      {isCollapsed ? (
        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
            {column.title} ({columnApps.length})
          </span>
        </div>
      ) : (
        /* 卡片列表 */
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-lg p-2 space-y-2 overflow-y-auto min-h-[200px] transition-colors ${
            isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 border-dashed' : 'border-2 border-transparent bg-gray-50/50 dark:bg-gray-900/50'
          }`}
        >
          <SortableContext
            items={columnApps.map(app => app.id)}
            strategy={verticalListSortingStrategy}
          >
            {columnApps.map((application) => (
              <SortableCard
                key={application.id}
                application={application}
                onUpdate={onUpdateJob}
                onDelete={onDeleteJob}
                onArchive={onArchiveJob}
                onToggleMaterial={onToggleMaterial}
                onOpenDetail={onOpenDetail}
                isSelected={selectedIds.includes(application.id)}
                onSelect={handleSelect}
                selectionMode={selectionMode}
              />
            ))}
          </SortableContext>
          
          {columnApps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              暂无申请记录
            </div>
          )}
        </div>
      )}
    </div>
  );
};

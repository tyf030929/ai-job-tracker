import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Search, Filter, X, Trash2, Archive, CheckSquare, Square, MoveRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KANBAN_COLUMNS, FILTER_STAGE_OPTIONS, CHANNEL_OPTIONS, isStageInColumn } from '@/constants/jobStages';
import { KanbanColumn } from './KanbanColumn';
import { SortableCard } from './SortableCard';
import { AddJobDialog } from './AddJobDialog';
import { JobDetailDrawer } from './JobDetailDrawer';

export const JobKanban = ({ 
  applications, 
  onAddJob, 
  onUpdateJob, 
  onDeleteJob,
  onArchiveJob,
  onMoveJob,
  onToggleMaterial,
  onBatchDelete,
  onBatchMove,
  onExportICS,
  onFilterChange
}) => {
  const [activeId, setActiveId] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogDefaultStage, setAddDialogDefaultStage] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterChannel, setFilterChannel] = useState('all');

  // 批量选择模式
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // 过滤后的申请数据 - 立即过滤
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    
    return applications.filter(app => {
      // 搜索过滤 - 立即按公司名和岗位名模糊匹配
      const matchesSearch = !searchQuery || 
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 阶段过滤
      let matchesStage = true;
      if (filterStage !== 'all') {
        if (filterStage === 'interview_all') {
          matchesStage = ['interview_1', 'interview_2', 'interview_hr'].includes(app.stage);
        } else {
          matchesStage = app.stage === filterStage;
        }
      }
      
      // 渠道过滤
      const matchesChannel = filterChannel === 'all' || app.channel === filterChannel;
      
      return matchesSearch && matchesStage && matchesChannel;
    });
  }, [applications, searchQuery, filterStage, filterChannel]);

  // 通知父组件过滤后的数据
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredApplications);
    }
  }, [filteredApplications, onFilterChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        const { active } = event;
        const node = active?.rect?.current?.translated || active?.rect?.current;
        return {
          x: node?.left || 0,
          y: node?.top || 0,
        };
      },
    })
  );

  const activeApplication = useMemo(() => 
    applications.find(app => app.id === activeId),
  [activeId, applications]);

  // 拖拽处理 - 修复：支持拖到列上和卡片上
  const handleDragStart = (event) => {
    console.log('拖拽开始:', event.active.id);
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    console.log('拖拽结束:', { active: active?.id, over: over?.id });

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    // 如果拖到自己身上，不做任何操作
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    // 首先检查是否拖到了列上
    const targetColumn = KANBAN_COLUMNS.find(col => col.id === overId);
    
    if (targetColumn) {
      // 拖到列上，确定目标阶段
      let targetStage;
      const currentApp = applications.find(app => app.id === activeId);
      
      if (Array.isArray(targetColumn.stage)) {
        // 如果列包含多个阶段
        if (currentApp && targetColumn.stage.includes(currentApp.stage)) {
          // 如果当前阶段已在该列中，保持当前阶段
          targetStage = currentApp.stage;
        } else {
          // 否则使用列的第一个阶段作为默认阶段
          targetStage = targetColumn.stage[0];
        }
      } else {
        // 列只有一个阶段
        targetStage = targetColumn.stage;
      }
      
      console.log('移动到列:', targetColumn.title, '阶段:', targetStage);
      onMoveJob(activeId, targetStage);
    } else {
      // 检查是否拖到了卡片上
      const overApp = applications.find(app => app.id === overId);
      if (overApp) {
        // 找到目标卡片所在的列
        const overColumn = KANBAN_COLUMNS.find(col => isStageInColumn(overApp.stage, col.stage));
        if (overColumn) {
          let targetStage;
          const currentApp = applications.find(app => app.id === activeId);
          
          if (Array.isArray(overColumn.stage)) {
            // 如果目标列包含多个阶段，使用目标卡片的阶段
            targetStage = overApp.stage;
          } else {
            // 目标列只有一个阶段
            targetStage = overColumn.stage;
          }
          
          console.log('移动到卡片:', overApp.companyName, '阶段:', targetStage);
          onMoveJob(activeId, targetStage);
        }
      }
    }

    setActiveId(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStage('all');
    setFilterChannel('all');
  };

  const hasActiveFilters = searchQuery || filterStage !== 'all' || filterChannel !== 'all';

  const handleOpenDetail = (application) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  // 批量选择相关
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map(app => app.id));
    }
  };

  const handleBatchDelete = () => {
    onBatchDelete(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleBatchMove = (newStage) => {
    onBatchMove(selectedIds, newStage);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  // 处理打开添加对话框
  const handleOpenAddDialog = (defaultStage = null) => {
    setAddDialogDefaultStage(defaultStage);
    setIsAddDialogOpen(true);
  };

  // 处理添加申请
  const handleAddJob = (formData) => {
    onAddJob(formData);
  };

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Esc 关闭弹窗或取消选择
      if (e.key === 'Escape') {
        if (isDetailOpen) {
          setIsDetailOpen(false);
        } else if (selectionMode) {
          exitSelectionMode();
        }
      }
      
      // J/K 上下切换（仅在非输入状态时）
      if (!isDetailOpen && !selectionMode && filteredApplications.length > 0) {
        if (e.key === 'j' || e.key === 'k') {
          e.preventDefault();
          const currentIndex = selectedApplication 
            ? filteredApplications.findIndex(app => app.id === selectedApplication.id)
            : -1;
          
          let newIndex;
          if (e.key === 'j') {
            newIndex = currentIndex + 1;
            if (newIndex >= filteredApplications.length) newIndex = 0;
          } else {
            newIndex = currentIndex - 1;
            if (newIndex < 0) newIndex = filteredApplications.length - 1;
          }
          
          setSelectedApplication(filteredApplications[newIndex]);
        }
        
        // Enter 展开详情
        if (e.key === 'Enter' && selectedApplication) {
          e.preventDefault();
          setIsDetailOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, selectionMode, filteredApplications, selectedApplication]);

  return (
    <div className="h-full flex flex-col">
      {/* 搜索和筛选栏 */}
      <div className="mb-4 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索公司或岗位..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[140px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="全部阶段" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {FILTER_STAGE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:focus:bg-gray-700">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[130px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue placeholder="全部渠道" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-gray-200 dark:focus:bg-gray-700">全部渠道</SelectItem>
              {CHANNEL_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="dark:text-gray-200 dark:focus:bg-gray-700">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              清除
            </Button>
          )}

          {/* 批量选择按钮 */}
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={() => selectionMode ? exitSelectionMode() : setSelectionMode(true)}
          >
            {selectionMode ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
            {selectionMode ? '完成' : '批量'}
          </Button>
        </div>
      </div>

      {/* 批量操作栏 - 固定在顶部 */}
      {selectionMode && selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-between flex-wrap gap-2 border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium dark:text-blue-200">
            已选择 {selectedIds.length} 项
          </span>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={handleSelectAll}>
              {selectedIds.length === filteredApplications.length ? '取消全选' : '全选'}
            </Button>
            <Select onValueChange={handleBatchMove}>
              <SelectTrigger className="w-[120px] h-8">
                <MoveRight className="h-3 w-3 mr-1" />
                <SelectValue placeholder="移动到" />
              </SelectTrigger>
              <SelectContent>
                {FILTER_STAGE_OPTIONS.filter(opt => opt.value !== 'all' && opt.value !== 'interview_all').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </div>
      )}

      {/* 看板内容 */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max p-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                applications={filteredApplications}
                onAddJob={handleOpenAddDialog}
                onUpdateJob={onUpdateJob}
                onDeleteJob={onDeleteJob}
                onArchiveJob={onArchiveJob}
                onToggleMaterial={onToggleMaterial}
                onOpenDetail={handleOpenDetail}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
              />
            ))}
            
            <DragOverlay>
              {activeApplication ? (
                <div className="opacity-80 rotate-2 scale-105">
                  <SortableCard
                    application={activeApplication}
                    onUpdate={onUpdateJob}
                    onDelete={onDeleteJob}
                    onArchive={onArchiveJob}
                    onToggleMaterial={onToggleMaterial}
                    onOpenDetail={handleOpenDetail}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* 筛选结果提示 */}
      {hasActiveFilters && (
        <div className="mt-2 text-sm text-muted-foreground dark:text-gray-400">
          显示 {filteredApplications.length} / {applications.length} 条申请
        </div>
      )}

      <AddJobDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddJob}
        defaultStage={addDialogDefaultStage}
      />

      <JobDetailDrawer
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        application={selectedApplication}
        onUpdate={onUpdateJob}
        onToggleMaterial={onToggleMaterial}
        onDelete={onDeleteJob}
        onExportICS={onExportICS}
      />
    </div>
  );
};

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

const JobKanban = ({
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
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [detailApplication, setDetailApplication] = useState(null);
  const [addJobStage, setAddJobStage] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !app.companyName?.toLowerCase().includes(q) &&
          !app.position?.toLowerCase().includes(q) &&
          !app.notes?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Stage filter
      if (stageFilter !== 'all') {
        if (stageFilter === 'interview_all') {
          if (!['interview_1', 'interview_2', 'interview_hr'].includes(app.stage)) {
            return false;
          }
        } else if (app.stage !== stageFilter) {
          return false;
        }
      }

      // Channel filter
      if (channelFilter !== 'all' && app.channel !== channelFilter) {
        return false;
      }

      // Archived filter
      if (!showArchived && app.archived) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, stageFilter, channelFilter, showArchived]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredApps);
    }
  }, [filteredApps, onFilterChange]);

  // DnD handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeApp = applications.find((a) => a.id === active.id);
    if (!activeApp) return;

    // Find target column
    const overId = over.id;
    const targetColumn = KANBAN_COLUMNS.find((col) => col.id === overId);

    if (targetColumn) {
      const newStage = Array.isArray(targetColumn.stage)
        ? targetColumn.stage[0]
        : targetColumn.stage;
      if (newStage !== activeApp.stage) {
        onMoveJob(active.id, newStage);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Selection handlers
  const handleToggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApps.map((a) => a.id));
    }
  }, [filteredApps, selectedIds]);

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Batch operations
  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`确定删除选中的 ${selectedIds.length} 条申请吗？`)) {
      onBatchDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleBatchMove = (newStage) => {
    if (selectedIds.length === 0) return;
    onBatchMove(selectedIds, newStage);
    setSelectedIds([]);
  };

  // Card click to open detail
  const handleCardClick = (app) => {
    setDetailApplication(app);
    setDetailDrawerOpen(true);
  };

  // Add job
  const handleAddJob = (stage) => {
    setAddJobStage(stage);
    setAddDialogOpen(true);
  };

  const handleAddJobSubmit = (jobData) => {
    onAddJob(jobData);
    setAddDialogOpen(false);
    setAddJobStage(null);
  };

  const activeApplication = activeId ? applications.find((a) => a.id === activeId) : null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索公司/岗位..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Stage filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="阶段" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_STAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Channel filter */}
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder="渠道" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部渠道</SelectItem>
            {CHANNEL_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Show archived toggle */}
        <Button
          variant={showArchived ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="h-9 px-2"
        >
          归档
        </Button>

        {/* Clear filters */}
        {(searchQuery || stageFilter !== 'all' || channelFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStageFilter('all');
              setChannelFilter('all');
            }}
            className="h-9 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            清除
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Selection actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{selectedIds.length} 项选中</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchMove('rejected')}
              className="h-9 text-xs"
            >
              <MoveRight className="h-3 w-3 mr-1" />
              批量移动
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              className="h-9"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearSelection} className="h-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Select all */}
        {selectedIds.length === 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-9 px-2"
          >
            <Square className="h-4 w-4 mr-1" />
            全选
          </Button>
        )}

        {/* Add job */}
        <Button
          size="sm"
          onClick={() => handleAddJob('submitted')}
          className="h-9"
        >
          + 添加
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex gap-3 p-3 h-full">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                applications={filteredApps}
                onAddJob={handleAddJob}
                onUpdateJob={onUpdateJob}
                onDeleteJob={onDeleteJob}
                onArchiveJob={onArchiveJob}
                onToggleMaterial={onToggleMaterial}
                onBatchDelete={onBatchDelete}
                onBatchMove={onBatchMove}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                isCollapsed={false}
                onToggleCollapse={() => {}}
              />
            ))}
          </div>

          <DragOverlay>
            {activeApplication ? (
              <div className="opacity-80">
                <SortableCard
                  application={activeApplication}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onArchive={() => {}}
                  onToggleMaterial={() => {}}
                  isSelected={false}
                  onToggleSelect={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Job Dialog */}
      <AddJobDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        initialStage={addJobStage}
        onAdd={handleAddJobSubmit}
      />

      {/* Detail Drawer */}
      <JobDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        application={detailApplication}
        onUpdate={onUpdateJob}
        onDelete={(id) => {
          onDeleteJob(id);
          setDetailDrawerOpen(false);
        }}
        onArchive={(id) => {
          onArchiveJob(id);
          setDetailDrawerOpen(false);
        }}
        onToggleMaterial={onToggleMaterial}
        onExportICS={onExportICS}
      />
    </div>
  );
};

export { JobKanban };
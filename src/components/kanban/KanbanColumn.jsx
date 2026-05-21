import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isStageInColumn, isCompletedStage } from '@/constants/jobStages';
import { SortableCard } from './SortableCard';

const KanbanColumn = ({
  column,
  applications,
  onAddJob,
  onUpdateJob,
  onDeleteJob,
  onArchiveJob,
  onToggleMaterial,
  onBatchDelete,
  onBatchMove,
  isCollapsed,
  onToggleCollapse,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const stageIds = Array.isArray(column.stage) ? column.stage : [column.stage];
  const columnApps = applications.filter((app) =>
    stageIds.some((stage) => isStageInColumn(app.stage, stage))
  );

  const totalCount = applications.filter((app) =>
    stageIds.some((stage) => isStageInColumn(app.stage, stage))
  ).length;

  const nonArchivedCount = columnApps.filter((app) => !app.archived).length;

  const columnColor = column.color || '#6366f1';

  return (
    <div
      className={`flex-shrink-0 w-[280px] bg-gray-100 dark:bg-gray-900/50 rounded-xl flex flex-col transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
      } ${isCollapsed ? 'w-12' : ''}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: columnColor }}
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {column.title}
              </span>
              <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                {nonArchivedCount}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onAddJob(column.stage)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mx-auto"
            onClick={onToggleCollapse}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Collapsed state */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mb-2"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {column.title}
          </span>
          <span className="text-xs text-gray-400 mt-1">{nonArchivedCount}</span>
        </div>
      )}

      {/* Cards area */}
      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-2 space-y-2"
          style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          <SortableContext
            items={columnApps.map((app) => app.id)}
            strategy={verticalListSortingStrategy}
          >
            {columnApps.map((app) => (
              <SortableCard
                key={app.id}
                application={app}
                onUpdate={onUpdateJob}
                onDelete={onDeleteJob}
                onArchive={onArchiveJob}
                onToggleMaterial={onToggleMaterial}
                isSelected={selectedIds.includes(app.id)}
                onToggleSelect={onToggleSelect}
                onSelectAll={onSelectAll}
              />
            ))}
          </SortableContext>

          {columnApps.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <p className="text-xs">暂无申请</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => onAddJob(column.stage)}
              >
                <Plus className="h-3 w-3 mr-1" />
                添加
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { KanbanColumn };
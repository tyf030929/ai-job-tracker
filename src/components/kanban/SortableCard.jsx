import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Calendar,
  MapPin,
  Briefcase,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Archive,
  Trash2,
} from 'lucide-react';
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
import { getStageLabel, getUrgencyLevel, isCompletedStage } from '@/constants/jobStages';

const SortableCard = ({
  application,
  onUpdate,
  onDelete,
  onArchive,
  onToggleMaterial,
  isSelected,
  onToggleSelect,
  onBatchDelete,
  onBatchMove,
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const urgency = getUrgencyLevel(application.deadline, application.stage);
  const isCompleted = isCompletedStage(application.stage);

  const getUrgencyColor = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30';
      case 'orange':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const completedMaterials = application.materials?.filter((m) => m.completed).length || 0;
  const totalMaterials = application.materials?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group"
    >
      <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(application.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {application.companyName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {application.position}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const stage = application.stage;
                    if (stage === 'interview_1') onUpdate(application.id, { stage: 'interview_2' });
                    else if (stage === 'interview_2') onUpdate(application.id, { stage: 'interview_hr' });
                  }}
                >
                  下一阶段
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(application.id)}>
                  <Archive className="h-3.5 w-3.5 mr-2" />
                  归档
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(application.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-1">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0.5 border-gray-300 dark:border-gray-600"
            >
              {application.channel}
            </Badge>
            {!isCompleted && (
              <Badge
                className={`text-[10px] px-1.5 py-0.5 ${getUrgencyColor(urgency.color)}`}
              >
                {urgency.label}
              </Badge>
            )}
            {application.location && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0.5 border-gray-300 dark:border-gray-600 flex items-center gap-0.5"
              >
                <MapPin className="h-2.5 w-2.5" />
                {application.location}
              </Badge>
            )}
          </div>

          {/* Salary */}
          {application.salary > 0 && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
              ¥{application.salary.toLocaleString()}
            </p>
          )}

          {/* Materials progress */}
          {totalMaterials > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${(completedMaterials / totalMaterials) * 100}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-gray-400">
                {completedMaterials}/{totalMaterials}
              </span>
            </div>
          )}

          {/* Deadline */}
          {!isCompleted && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {format(parseISO(application.deadline), 'MM/dd', { locale: zhCN })}
              </span>
            </div>
          )}

          {/* Expand toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="w-full flex items-center justify-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-2 py-1 border-t border-gray-100 dark:border-gray-700"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                详情
              </>
            )}
          </button>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {application.notes && (
                <div>
                  <span className="text-[10px] text-gray-400">备注</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {application.notes}
                  </p>
                </div>
              )}
              {application.link && (
                <a
                  href={application.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" />
                  查看职位
                </a>
              )}
              {/* Materials checklist */}
              {totalMaterials > 0 && (
                <div>
                  <span className="text-[10px] text-gray-400">材料</span>
                  <div className="mt-1 space-y-1">
                    {application.materials.map((mat) => (
                      <label
                        key={mat.id}
                        className="flex items-center gap-1.5 text-xs cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={mat.completed}
                          onCheckedChange={() => onToggleMaterial(application.id, mat.id)}
                        />
                        <span
                          className={
                            mat.completed
                              ? 'line-through text-gray-400'
                              : 'text-gray-700 dark:text-gray-300'
                          }
                        >
                          {mat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { SortableCard };
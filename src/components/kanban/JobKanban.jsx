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

export
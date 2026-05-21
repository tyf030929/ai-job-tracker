import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  differenceInDays,
  startOfDay,
  startOfWeek as startOfWeekFn,
  endOfWeek as endOfWeekFn,
  addMonths,
  subMonths
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddJobDialog } from '@/components/kanban/AddJobDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export
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

export
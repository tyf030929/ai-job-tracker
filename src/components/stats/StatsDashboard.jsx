import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Target,
  Download,
  AlertCircle,
  Percent,
  Timer,
  Wallet,
  CalendarClock,
  Hourglass
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { STAGE_OPTIONS, getStageLabel } from '@/constants/jobStages';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 75) return 'text-blue-600 dark:text-blue-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getStrategyLabel = (score) => {
  if (score >= 90) return { label: '直接投递', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' };
  if (score >= 75) return { label: '建议投递', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' };
  if (score >= 60) return { label: '改了再投', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' };
  return { label: '慎重考虑', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' };
};

export const StrategyAdvice = ({ strategy, score }) => {
  if (!strategy) return null;
  const { label, color } = getStrategyLabel(score);

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 dark:text-gray-200">
          <Lightbulb className="h-4 w-4 text-blue-500" />
          投递策略建议
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className={cn("px-3 py-1.5 rounded-lg text-sm font-medium shrink-0", color)}>
            {label}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {strategy}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>当前匹配度</span>
              <ArrowRight className="h-3 w-3" />
              <span className={cn("font-bold", getScoreColor(score))}>{score} 分</span>
              <span>→</span>
              <span>目标</span>
              <span className="font-bold text-green-600 dark:text-green-400">80+ 分</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

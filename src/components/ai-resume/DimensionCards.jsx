import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, Code2, FolderOpen, Users } from 'lucide-react';

const dimensionConfig = {
  experience: { label: '工作经验', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400' },
  skills: { label: '技能要求', icon: Code2, color: 'text-purple-600 dark:text-purple-400' },
  projects: { label: '项目经历', icon: FolderOpen, color: 'text-green-600 dark:text-green-400' },
  soft_skills: { label: '软性要求', icon: Users, color: 'text-orange-600 dark:text-orange-400' },
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBarColor = (score) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const DimensionCards = ({ dimensionScores }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Object.entries(dimensionScores).map(([key, data]) => {
        const config = dimensionConfig[key];
        if (!config) return null;
        const Icon = config.icon;

        return (
          <Card key={key} className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-medium dark:text-gray-200">{config.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className={cn("text-2xl font-bold", getScoreColor(data.score))}>
                  {data.score}
                </span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
              {/* 进度条 */}
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", getScoreBarColor(data.score))}
                  style={{ width: `${data.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{data.analysis}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

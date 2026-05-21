import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Wrench, FolderOpen, Users } from 'lucide-react';

const DimensionCards = ({ dimensions }) => {
  // Default dimensions data
  const defaultDimensions = [
    {
      name: '工作经验',
      score: 85,
      icon: Briefcase,
      description: '工作年限和经历匹配度',
      color: 'blue'
    },
    {
      name: '技能要求',
      score: 72,
      icon: Wrench,
      description: '技术技能与工具匹配度',
      color: 'green'
    },
    {
      name: '项目经历',
      score: 68,
      icon: FolderOpen,
      description: '项目经验相关性',
      color: 'purple'
    },
    {
      name: '软技能',
      score: 55,
      icon: Users,
      description: '沟通协作等软实力',
      color: 'orange'
    }
  ];

  const items = dimensions || defaultDimensions;

  const colorMap = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', progress: 'bg-blue-500' },
    green: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', progress: 'bg-green-500' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', progress: 'bg-purple-500' },
    orange: { bg: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400', progress: 'bg-orange-500' }
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return { label: '优秀', color: 'text-green-600' };
    if (score >= 60) return { label: '良好', color: 'text-blue-600' };
    if (score >= 40) return { label: '一般', color: 'text-yellow-600' };
    return { label: '较弱', color: 'text-red-600' };
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((dim, index) => {
        const Icon = dim.icon;
        const colors = colorMap[dim.color] || colorMap.blue;
        const level = getScoreLevel(dim.score);

        return (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                  <CardTitle className="text-base font-medium">{dim.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${colors.text}`}>{dim.score}</span>
                  <Badge variant="outline" className={level.color}>
                    {level.label}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-xs text-muted-foreground mb-3">{dim.description}</p>
              <div className="space-y-1">
                <Progress
                  value={dim.score}
                  className="h-2"
                  indicatorClassName={colors.progress}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DimensionCards;
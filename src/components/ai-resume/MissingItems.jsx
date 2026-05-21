import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MissingItems = ({ items }) => {
  // Default missing items
  const defaultItems = [
    {
      text: 'Kubernetes 经验',
      priority: 'high',
      description: '需要熟练使用 K8s 进行容器编排',
      suggestion: '建议补充 K8s 实践经验或相关项目'
    },
    {
      text: 'AWS 云服务',
      priority: 'high',
      description: '岗位要求熟悉 AWS 生态',
      suggestion: '可补充 AWS 认证或相关使用经验'
    },
    {
      text: '微服务架构',
      priority: 'medium',
      description: '有微服务设计经验优先',
      suggestion: '可描述参与过的分布式系统设计'
    },
    {
      text: 'GraphQL',
      priority: 'low',
      description: '了解 GraphQL API 设计',
      suggestion: '可快速学习补充相关知识'
    }
  ];

  const missingItems = items || defaultItems;

  const priorityConfig = {
    high: {
      label: '高优先级',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
      icon: TrendingUp
    },
    medium: {
      label: '中优先级',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400',
      icon: Minus
    },
    low: {
      label: '低优先级',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
      icon: TrendingDown
    }
  };

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/50">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-base">缺失项 ({missingItems.length})</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          职位要求中您可能需要补充的技能或经验
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {missingItems.map((item, index) => {
          const config = priorityConfig[item.priority] || priorityConfig.medium;
          const PriorityIcon = config.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50"
            >
              <PriorityIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm">{item.text}</span>
                  <Badge className={`text-xs ${config.color}`}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {item.description}
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 italic">
                  💡 {item.suggestion}
                </p>
              </div>
            </div>
          );
        })}

        {missingItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">恭喜！暂无缺失项</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingItems;
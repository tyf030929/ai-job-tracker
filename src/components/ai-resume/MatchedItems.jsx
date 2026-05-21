import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';

const MatchedItems = ({ items }) => {
  // Default matched items
  const defaultItems = [
    {
      text: 'Python 编程经验',
      source: '简历：3年 Python 开发经验',
      relevance: 95
    },
    {
      text: '机器学习算法',
      source: '简历：主导图像识别项目',
      relevance: 88
    },
    {
      text: '数据处理能力',
      source: '简历：熟悉 Pandas、NumPy',
      relevance: 85
    },
    {
      text: '团队协作经验',
      source: '简历：曾带领5人小组完成项目',
      relevance: 78
    },
    {
      text: 'Docker 容器化',
      source: '简历：熟练使用 Docker 进行部署',
      relevance: 75
    }
  ];

  const matchedItems = items || defaultItems;

  return (
    <Card className="border-green-200 dark:border-green-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/50">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-base">匹配项 ({matchedItems.length})</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          您的简历中与职位要求高度匹配的内容
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {matchedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{item.text}</span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-200/50 text-green-700 dark:bg-green-800/50 dark:text-green-300"
                >
                  {item.relevance}% 匹配
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {item.source}
              </p>
            </div>
          </div>
        ))}

        {matchedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无高匹配项</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchedItems;
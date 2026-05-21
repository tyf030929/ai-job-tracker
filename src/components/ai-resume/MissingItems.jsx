import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityColors = {
  '高': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '低': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const priorityBorderColors = {
  '高': 'border-red-300 dark:border-red-800',
  '中': 'border-yellow-300 dark:border-yellow-800',
  '低': 'border-gray-300 dark:border-gray-700',
};

export const MissingItems = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 dark:text-gray-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          缺失项
          <Badge variant="secondary" className="ml-1">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border",
              priorityBorderColors[item.priority]
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {item.requirement}
              </span>
              <Badge className={cn("shrink-0 text-[10px]", priorityColors[item.priority])}>
                {item.priority}优先级
              </Badge>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              💡 {item.suggestion}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

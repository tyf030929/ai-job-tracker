import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const strengthColors = {
  '强': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '弱': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export const MatchedItems = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 dark:text-gray-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          匹配项
          <Badge variant="secondary" className="ml-1">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {item.requirement}
              </span>
              <Badge className={cn("shrink-0 text-[10px]", strengthColors[item.strength])}>
                {item.strength}
              </Badge>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              📄 {item.evidence}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

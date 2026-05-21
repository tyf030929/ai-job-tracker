import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const KanbanSkeleton = () => {
  return (
    <div className="h-full flex gap-4 p-1">
      {[1, 2, 3, 4, 5].map((column) => (
        <div key={column} className="min-w-[280px] w-[280px] flex flex-col">
          {/* 列标题骨架 */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          
          {/* 卡片列表骨架 */}
          <div className="flex-1 space-y-2 p-2 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg">
            {[1, 2, 3].map((card) => (
              <div key={card} className="bg-white dark:bg-gray-800 rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-6 rounded-md" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

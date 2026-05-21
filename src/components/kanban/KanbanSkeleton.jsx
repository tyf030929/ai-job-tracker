import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const KanbanSkeleton = () => {
  return (
    <div className="flex gap-3 overflow-x-auto p-4 h-full">
      {[1, 2, 3, 4, 5].map((col) => (
        <div key={col} className="flex-shrink-0 w-[280px] bg-white dark:bg-gray-900 rounded-xl p-3 flex flex-col gap-3">
          {/* Column header */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {/* Cards */}
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default KanbanSkeleton;
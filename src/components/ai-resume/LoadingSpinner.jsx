import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-xs">🤖</span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        AI 正在分析简历与岗位匹配度...
      </p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        预计需要 3-5 秒
      </p>
    </div>
  );
};

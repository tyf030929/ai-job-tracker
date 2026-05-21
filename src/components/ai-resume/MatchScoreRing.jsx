import React from 'react';
import { cn } from '@/lib/utils';

const getScoreColor = (score) => {
  if (score >= 90) return { stroke: '#22c55e', bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', label: '强烈推荐投递' };
  if (score >= 75) return { stroke: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', label: '建议投递' };
  if (score >= 60) return { stroke: '#eab308', bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-600 dark:text-yellow-400', label: '需要优化' };
  return { stroke: '#ef4444', bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', label: '建议慎重' };
};

export const MatchScoreRing = ({ score }) => {
  const { stroke, bg, text, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center p-6 rounded-xl", bg)}>
      <div className="relative w-32 h-32">
        {/* 背景圆环 */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* 进度圆环 */}
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* 中心数字 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", text)}>{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/ 100</span>
        </div>
      </div>
      <p className={cn("mt-3 text-sm font-medium", text)}>{label}</p>
    </div>
  );
};

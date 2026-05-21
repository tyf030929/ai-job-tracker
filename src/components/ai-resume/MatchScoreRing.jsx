import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MatchScoreRing = ({ score = 0, size = 180, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = (s) => {
    if (s >= 80) return '#22c55e'; // green
    if (s >= 60) return '#84cc16'; // lime
    if (s >= 40) return '#eab308'; // yellow
    if (s >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const color = getColor(score);

  const getLabel = (s) => {
    if (s >= 80) return '高度匹配';
    if (s >= 60) return '良好匹配';
    if (s >= 40) return '中等匹配';
    if (s >= 20) return '较低匹配';
    return '匹配度低';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-800"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground">分</span>
        </div>
      </div>

      {/* Label */}
      <span
        className="text-sm font-medium px-3 py-1 rounded-full"
        style={{
          backgroundColor: `${color}20`,
          color: color
        }}
      >
        {getLabel(score)}
      </span>

      {/* Description */}
      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        {score >= 60
          ? '您的简历与该职位有较好的匹配度，建议投递'
          : score >= 40
          ? '匹配度一般，建议针对 JD 优化简历后再投递'
          : '匹配度较低，建议充分了解岗位要求后再尝试'}
      </p>
    </div>
  );
};

export default MatchScoreRing;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';

export const RewrittenSections = ({ sections }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 dark:text-gray-200">
          <Pencil className="h-4 w-4 text-yellow-500" />
          简历改写建议
          <Badge variant="secondary" className="ml-1">{sections.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-2">
              📍 {section.section}
            </div>
            {/* 原文 */}
            <div className="mb-2">
              <div className="text-[10px] text-gray-400 mb-0.5">原文</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-through decoration-red-300">
                {section.original}
              </p>
            </div>
            {/* 改写后 */}
            <div className="mb-2">
              <div className="text-[10px] text-gray-400 mb-0.5">改写后</div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium bg-green-50 dark:bg-green-900/30 p-2 rounded">
                {section.improved}
              </p>
            </div>
            {/* 改写原因 */}
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              ✨ {section.reason}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

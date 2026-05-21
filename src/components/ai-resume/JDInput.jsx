import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

export const JDInput = ({ value, onChange }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          目标岗位 JD
        </label>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-gray-400"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <Textarea
        placeholder={"请粘贴目标岗位的JD（Job Description）...\n\n示例：\n某互联网公司招聘AI产品经理\n岗位要求：\n1. 3年以上互联网产品经验\n2. 有AI/LLM相关项目经验\n3. 熟悉数据分析，能独立完成数据驱动决策\n4. 有B端SaaS产品经验优先"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[300px] lg:min-h-[400px] resize-none text-sm"
      />
      <div className="text-xs text-gray-400 mt-1">
        {value.length > 0 ? `${value.length} 字` : '从招聘网站复制粘贴即可'}
      </div>
    </div>
  );
};

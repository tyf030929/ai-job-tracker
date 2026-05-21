import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';
import { extractTextFromFile } from '@/api/analyzeResume';
import { toast } from 'sonner';

export const ResumeInput = ({ value, onChange }) => {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromFile(file);
      onChange(text);
      toast.success('简历文本已提取');
    } catch (err) {
      toast.error(err.message);
    } finally {
      // 重置input，允许重复上传同名文件
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          我的简历
        </label>
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            上传TXT
          </Button>
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
      </div>
      <Textarea
        placeholder={"请粘贴简历全文...\n\n示例：\n汤宇飞\n武汉大学 · 生物与医药 硕士在读\nAI产品实践者\n\n产品项目经历\n差异代谢物与药用化合物筛选分析平台..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[300px] lg:min-h-[400px] resize-none text-sm"
      />
      <div className="text-xs text-gray-400 mt-1">
        {value.length > 0 ? `${value.length} 字` : '支持粘贴文本或上传TXT文件'}
      </div>
    </div>
  );
};

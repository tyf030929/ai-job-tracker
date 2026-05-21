import React, { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { extractTextFromFile } from '@/api/analyzeResume';
import { toast } from 'sonner';

const ACCEPTED_RESUME_TYPES = '.txt,.pdf,.docx';

export const ResumeInput = ({ value, onChange, onFileSelect }) => {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // 验证文件类型
    const ext = file.name.toLowerCase().split('.').pop();
    const allowed = ['txt', 'pdf', 'docx'];
    if (!allowed.includes(ext)) {
      toast.error('不支持的文件格式，请上传 TXT、PDF 或 DOCX 文件');
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);

    try {
      if (ext === 'txt') {
        // txt 直接读取
        const text = await file.text();
        onChange(text);
        toast.success('简历文本已提取');
      } else {
        // PDF/DOCX 需要提取
        if (onFileSelect) {
          // 传递 File 对象，由外部处理
          onFileSelect(file);
        } else {
          const text = await extractTextFromFile(file);
          onChange(text);
          toast.success('简历文本已提取');
        }
      }
    } catch (err) {
      toast.error(err.message || '文件解析失败');
      setFileName('');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const clearFile = () => {
    setFileName('');
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
            accept={ACCEPTED_RESUME_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExtracting}
          >
            <Upload className="h-3 w-3 mr-1" />
            上传文件
          </Button>
          {fileName && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-400"
              onClick={clearFile}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* 文件上传区域 */}
      <div
        className={`
          relative mb-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
          ${isExtracting ? 'opacity-60 pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {fileName ? (
          <div className="flex items-center justify-center gap-2">
            <File className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{fileName}</span>
            {isExtracting ? (
              <span className="text-xs text-gray-400 animate-pulse">提取中...</span>
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            <div className="mb-1">
              <span className="text-blue-500 font-medium">点击上传</span> 或拖拽文件到此处
            </div>
            <div className="text-xs">支持 TXT / PDF / DOCX 格式</div>
          </div>
        )}
      </div>

      {/* 文本输入区 */}
      <Textarea
        placeholder={"请粘贴简历全文，或上传文件...\n\n快捷提示：\n• TXT 文件：直接粘贴内容\n• PDF/DOCX：上传后自动提取文本\n• 提取失败：直接粘贴内容到下方文本框"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[250px] lg:min-h-[350px] resize-none text-sm"
      />
      <div className="text-xs text-gray-400 mt-1">
        {value.length > 0 ? `${value.length} 字` : '支持粘贴文本或上传 TXT / PDF / DOCX 文件'}
      </div>
    </div>
  );
};
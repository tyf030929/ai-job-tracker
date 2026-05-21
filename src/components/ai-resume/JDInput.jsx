import React, { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Upload, File, Image, CheckCircle } from 'lucide-react';
import { extractTextFromFile, isImageFile } from '@/api/analyzeResume';
import { toast } from 'sonner';

const ACCEPTED_JD_TEXT_TYPES = '.txt,.pdf,.docx';
const ACCEPTED_JD_IMAGE_TYPES = '.jpg,.jpeg,.png,.gif,.webp,.bmp';

export const JDInput = ({ value, onChange, onImageSelect, onImagePreview }) => {
  const textFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleTextFileUpload = async (file) => {
    if (!file) return;

    const ext = file.name.toLowerCase().split('.').pop();
    const allowed = ['txt', 'pdf', 'docx'];
    if (!allowed.includes(ext)) {
      toast.error('文本格式仅支持 TXT、PDF、DOCX');
      return;
    }

    setIsExtracting(true);
    setFileName(file.name);
    setPreviewUrl(null);

    try {
      const text = await extractTextFromFile(file);
      onChange(text);
      toast.success('JD 文本已提取');
    } catch (err) {
      toast.error(err.message || '文件解析失败');
      setFileName('');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    if (!isImageFile(file)) {
      toast.error('请上传图片文件：JPG、PNG、GIF、WEBP 等');
      return;
    }

    // 保存预览 URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    setIsExtracting(false);

    // 传递给外部处理
    if (onImageSelect) {
      onImageSelect(file);
    }
    if (onImagePreview) {
      onImagePreview(url);
    }

    toast.success('JD 图片已上传，AI 将自动识别图片中的文字');
  };

  const handleTextFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleTextFileUpload(file);
    e.target.value = '';
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleImageUpload(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (isImageFile(file)) {
      await handleImageUpload(file);
    } else {
      await handleTextFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const clearAll = () => {
    setFileName('');
    setPreviewUrl(null);
    onChange('');
    if (onImagePreview) onImagePreview(null);
    if (textFileInputRef.current) textFileInputRef.current.value = '';
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          目标岗位 JD
        </label>
        <div className="flex gap-1">
          <input
            ref={textFileInputRef}
            type="file"
            accept={ACCEPTED_JD_TEXT_TYPES}
            className="hidden"
            onChange={handleTextFileChange}
          />
          <input
            ref={imageFileInputRef}
            type="file"
            accept={ACCEPTED_JD_IMAGE_TYPES}
            className="hidden"
            onChange={handleImageFileChange}
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => textFileInputRef.current?.click()}
            disabled={isExtracting}
            title="上传文本文件"
          >
            <Upload className="h-3 w-3 mr-1" />
            文本
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => imageFileInputRef.current?.click()}
            disabled={isExtracting}
            title="上传 JD 图片"
          >
            <Image className="h-3 w-3 mr-1" />
            图片
          </Button>
          {(fileName || value) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-400"
              onClick={clearAll}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* 图片预览区域 */}
      {previewUrl && (
        <div className="relative mb-2 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <img
            src={previewUrl}
            alt="JD 图片预览"
            className="max-h-40 w-full object-contain bg-gray-50 dark:bg-gray-800"
          />
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Image className="h-3 w-3" />
            图片模式
          </div>
        </div>
      )}

      {/* 文件上传区域 */}
      {!previewUrl && (
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
                <span className="text-blue-500 font-medium">点击上传</span> 或拖拽到此处
              </div>
              <div className="text-xs">
                文本：TXT / PDF / DOCX　　图片：JPG / PNG / GIF / WEBP
              </div>
            </div>
          )}
        </div>
      )}

      {/* 文本输入区 */}
      <Textarea
        placeholder={
          "请粘贴岗位 JD 内容...\n\n快捷提示：\n• 文本 JD：直接粘贴或上传文件\n• 图片 JD：上传图片，AI 自动识别文字\n• 图片模式下无需填写此文本框"
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[250px] lg:min-h-[350px] resize-none text-sm"
        disabled={!!previewUrl}
      />
      <div className="text-xs text-gray-400 mt-1">
        {previewUrl
          ? '📷 图片模式已启用，文本框已禁用'
          : value.length > 0
          ? `${value.length} 字`
          : '支持粘贴文本、上传文件，或上传 JD 图片（AI 识别）'}
      </div>
    </div>
  );
};
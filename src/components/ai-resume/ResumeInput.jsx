import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const ResumeInput = ({ onResumeChange }) => {
  const [resumeMode, setResumeMode] = useState('text'); // 'text' | 'upload'
  const [resumeText, setResumeText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [dragActive, setDragActive] = useState(false);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setResumeText(text);
    if (onResumeChange) {
      onResumeChange(text);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processFile = async (file) => {
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.txt', '.pdf', '.docx'];

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('不支持的文件格式，请上传 TXT、PDF 或 DOCX 文件');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadedFile({ name: file.name, size: file.size });

    try {
      let content = '';
      if (fileExt === '.txt') {
        content = await readFileContent(file);
      } else if (fileExt === '.pdf' || fileExt === '.docx') {
        // For PDF/DOCX, we just read as text (simplified)
        // In production, you'd use a proper parser
        content = await readFileContent(file);
      }

      setUploadStatus('success');
      toast.success('简历上传成功');

      if (onResumeChange) {
        onResumeChange(content, file.name);
      }
    } catch (error) {
      setUploadStatus('error');
      toast.error('文件读取失败：' + error.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    if (onResumeChange) {
      onResumeChange('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          上传简历
        </CardTitle>
        <CardDescription>支持文本输入或文件上传（TXT/PDF/DOCX）</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={resumeMode} onValueChange={setResumeMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文本输入</TabsTrigger>
            <TabsTrigger value="upload">文件上传</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <Textarea
              placeholder="粘贴您的简历内容..."
              value={resumeText}
              onChange={handleTextChange}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>字符数：{resumeText.length}</span>
              {resumeText.length > 0 && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已输入
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : uploadStatus === 'error'
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                  : uploadStatus === 'success'
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {uploadStatus === 'idle' && (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    拖拽文件到此处，或点击下方按钮选择
                  </p>
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('resume-file-input')?.click()}
                  >
                    选择文件
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持 TXT、PDF、DOCX 格式
                  </p>
                </>
              )}

              {uploadStatus === 'uploading' && (
                <>
                  <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-sm text-muted-foreground">正在读取文件...</p>
                </>
              )}

              {uploadStatus === 'success' && uploadedFile && (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {uploadStatus === 'error' && (
                <>
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">文件读取失败</p>
                  <Button variant="outline" onClick={handleRemoveFile}>
                    重新选择
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeInput;
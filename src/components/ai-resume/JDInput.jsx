import React, { useState } from 'react';
import { FileText, Image, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const JDInput = ({ onJDChange }) => {
  const [jdMode, setJdMode] = useState('text'); // 'text' | 'image'
  const [jdText, setJdText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle' | 'uploading' | 'success'
  const [dragActive, setDragActive] = useState(false);

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJdText(text);
    if (onJDChange) {
      onJDChange(text, 'text');
    }
  };

  const processImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('请上传图片文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSetImage(file);
    }
  };

  const processAndSetImage = async (file) => {
    setUploadStatus('uploading');
    setUploadedImage({ name: file.name, size: file.size });

    try {
      const dataUrl = await processImageFile(file);
      setUploadStatus('success');
      toast.success('图片上传成功');

      if (onJDChange) {
        onJDChange(dataUrl, 'image');
      }
    } catch (error) {
      setUploadStatus('idle');
      toast.error(error.message || '图片处理失败');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndSetImage(file);
    } else {
      toast.error('请上传图片文件');
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

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setUploadStatus('idle');
    if (onJDChange) {
      onJDChange('', 'text');
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
          输入职位描述
        </CardTitle>
        <CardDescription>支持文本输入或上传 JD 图片</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={jdMode} onValueChange={setJdMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文本输入</TabsTrigger>
            <TabsTrigger value="image">图片上传</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <Textarea
              placeholder="粘贴职位描述内容..."
              value={jdText}
              onChange={handleTextChange}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>字符数：{jdText.length}</span>
              {jdText.length > 0 && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已输入
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
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
                  <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    拖拽 JD 图片到此处，或点击下方按钮选择
                  </p>
                  <input
                    type="file"
                    id="jd-image-input"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('jd-image-input')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    选择图片
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持 JPG、PNG、GIF、WebP 格式
                  </p>
                </>
              )}

              {uploadStatus === 'uploading' && (
                <>
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">正在处理图片...</p>
                </>
              )}

              {uploadStatus === 'success' && uploadedImage && (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="JD Preview"
                      className="max-h-64 rounded-lg mx-auto shadow-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      {uploadedImage.name} ({formatFileSize(uploadedImage.size)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JDInput;
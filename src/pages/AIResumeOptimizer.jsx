import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, RotateCcw } from 'lucide-react';
import { ResumeInput } from '@/components/ai-resume/ResumeInput';
import { JDInput } from '@/components/ai-resume/JDInput';
import { MatchScoreRing } from '@/components/ai-resume/MatchScoreRing';
import { DimensionCards } from '@/components/ai-resume/DimensionCards';
import { MatchedItems } from '@/components/ai-resume/MatchedItems';
import { MissingItems } from '@/components/ai-resume/MissingItems';
import { RewrittenSections } from '@/components/ai-resume/RewrittenSections';
import { StrategyAdvice } from '@/components/ai-resume/StrategyAdvice';
import { LoadingSpinner } from '@/components/ai-resume/LoadingSpinner';
import { analyzeResume, extractTextFromFile } from '@/api/analyzeResume';
import { toast } from 'sonner';

const AIResumeOptimizer = () => {
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);   // File object for PDF/DOCX
  const [jdText, setJdText] = useState('');
  const [jdImage, setJdImage] = useState(null);           // File object for JD image
  const [jdImagePreview, setJdImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 简历文件选择（PDF/DOCX，由外部提取文本）
  const handleResumeFileSelect = async (file) => {
    try {
      const text = await extractTextFromFile(file);
      setResumeFile(file);
      setResumeText(text);
      toast.success('简历已解析，共 ' + text.length + ' 字');
    } catch (err) {
      toast.error(err.message || '简历解析失败');
    }
  };

  // JD 图片选择
  const handleJdImageSelect = (file) => {
    setJdImage(file);
    // 图片模式下，清空文本（用户不能用文本模式）
    setJdText('');
  };

  // JD 图片预览清除
  const handleJdImagePreview = (url) => {
    setJdImagePreview(url);
  };

  // 开始分析
  const handleAnalyze = async () => {
    // 验证输入
    if (!resumeText.trim() && !resumeFile) {
      toast.error('请先上传简历');
      return;
    }
    if (!jdText.trim() && !jdImage) {
      toast.error('请先输入 JD（文本或图片）');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeResume({
        resumeInput: resumeText,
        jdInput: jdText,
      });
      setResult(analysisResult);
      toast.success('分析完成！');
    } catch (err) {
      setError(err.message);
      toast.error('分析失败：' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 重置
  const handleReset = () => {
    setResumeText('');
    setResumeFile(null);
    setJdText('');
    setJdImage(null);
    setJdImagePreview(null);
    setResult(null);
    setError(null);
  };

  const canAnalyze = (resumeText.trim() || resumeFile) && (jdText.trim() || jdImage);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 页面标题 */}
      <div className="shrink-0 px-4 py-3 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold dark:text-white">AI 简历优化</h1>
              <p className="text-xs text-gray-400">
                智能分析简历与岗位匹配度 · 支持 PDF / DOCX / 图片
              </p>
            </div>
          </div>
          {result && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              重新分析
            </Button>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto p-4">
        {!result ? (
          /* 输入阶段 */
          <div className="h-full flex flex-col gap-4">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
              <ResumeInput
                value={resumeText}
                onChange={setResumeText}
                onFileSelect={handleResumeFileSelect}
              />
              <JDInput
                value={jdText}
                onChange={setJdText}
                onImageSelect={handleJdImageSelect}
                onImagePreview={handleJdImagePreview}
              />
            </div>

            {/* 分析按钮 */}
            <div className="shrink-0 flex justify-center pb-4">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !canAnalyze}
                className="px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    开始 AI 分析
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* 结果展示阶段 */
          <div className="space-y-4 max-w-4xl mx-auto pb-8">
            {/* 总体评分 + 维度评分 */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <MatchScoreRing score={result.overall_score} />
              </div>
              <div className="lg:col-span-3">
                <DimensionCards dimensionScores={result.dimension_scores} />
              </div>
            </div>

            {/* Tab 切换 */}
            <Tabs defaultValue="missing" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="matched" className="text-xs">
                  ✅ 匹配项 ({result.matched_items?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="missing" className="text-xs">
                  ⚠️ 缺失项 ({result.missing_items?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="rewrite" className="text-xs">
                  ✏️ 改写建议 ({result.rewritten_sections?.length || 0})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="matched">
                <MatchedItems items={result.matched_items} />
              </TabsContent>
              <TabsContent value="missing">
                <MissingItems items={result.missing_items} />
              </TabsContent>
              <TabsContent value="rewrite">
                <RewrittenSections sections={result.rewritten_sections} />
              </TabsContent>
            </Tabs>

            {/* 投递策略 */}
            <StrategyAdvice
              strategy={result.application_strategy}
              score={result.overall_score}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResumeOptimizer;
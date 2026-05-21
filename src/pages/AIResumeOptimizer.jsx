import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Zap, RotateCcw, MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import { ResumeInput } from '@/components/ai-resume/ResumeInput';
import { JDInput } from '@/components/ai-resume/JDInput';
import { MatchScoreRing } from '@/components/ai-resume/MatchScoreRing';
import { DimensionCards } from '@/components/ai-resume/DimensionCards';
import { MatchedItems } from '@/components/ai-resume/MatchedItems';
import { MissingItems } from '@/components/ai-resume/MissingItems';
import { RewrittenSections } from '@/components/ai-resume/RewrittenSections';
import { StrategyAdvice } from '@/components/ai-resume/StrategyAdvice';
import { LoadingSpinner } from '@/components/ai-resume/LoadingSpinner';
import { analyzeResume, askAI, extractTextFromFile } from '@/api/analyzeResume';
import { toast } from 'sonner';

const AIResumeOptimizer = () => {
  // 输入状态
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdImage, setJdImage] = useState(null);
  const [jdImagePreview, setJdImagePreview] = useState(null);

  // 分析状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 对话状态
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  // 简历文件选择
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
    setJdText('');
  };

  // 开始分析
  const handleAnalyze = async () => {
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
    setChatMessages([]);

    try {
      const analysisResult = await analyzeResume({ resumeText, jdText });
      setResult(analysisResult);

      // 初始化对话：AI 分析完成后的欢迎语
      setChatMessages([
        {
          role: 'assistant',
          content: `✅ 分析完成！匹配度 **${analysisResult.overall_score}分**。

基于本次分析，我可以帮你：
• 细化某一条改写建议
• 针对某个缺失项给出具体优化方案
• 解释某个评分维度的判断依据
• 帮你把简历话术改写得更有竞争力

有什么想深入聊的，直接问我！`,
        },
      ]);

      toast.success('分析完成！');
    } catch (err) {
      setError(err.message);
      toast.error('分析失败：' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 发送追问
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatting) return;
    if (!result) {
      toast.error('请先完成一次分析');
      return;
    }

    const question = chatInput.trim();
    setChatInput('');
    setIsChatting(true);

    // 添加用户消息
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const answer = await askAI(question, resumeText, jdText, result);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch (err) {
      toast.error('AI 回复失败：' + err.message);
      // 移除刚才添加的用户消息
      setChatMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatting(false);
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
    setChatMessages([]);
    setShowChat(false);
  };

  // 滚动到底部
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const canAnalyze = (resumeText.trim() || resumeFile) && (jdText.trim() || jdImage);

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* 页面标题 */}
      <div className="shrink-0 px-4 py-3 border-b bg-white dark:bg-gray-900 dark:border-gray-800 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold dark:text-white">AI 简历优化</h1>
              <p className="text-xs text-gray-400">支持 PDF / DOCX · 真实 AI 分析 · 可追问</p>
            </div>
          </div>
          <div className="flex gap-2">
            {result && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className={showChat ? 'bg-blue-50 dark:bg-blue-900 border-blue-300' : ''}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {showChat ? '收起对话' : '和AI对话'}
              </Button>
            )}
            {result && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                重新分析
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto p-4">
        {!result ? (
          /* ========== 输入阶段 ========== */
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
                onImagePreview={setJdImagePreview}
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
                    <span className="mr-2">AI 分析中...</span>
                    <span className="text-xs opacity-75">MiniMax-Text-01 模型思考中</span>
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
          /* ========== 结果展示阶段 ========== */
          <div className={`space-y-4 max-w-4xl pb-8 ${showChat ? 'pr-[380px]' : ''} transition-all`}>
            {/* API 调用日志（调试用，生产环境隐藏） */}
            <div className="text-xs text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 rounded p-2 font-mono">
              🤖 调用模型：MiniMax-Text-01 | 简历：{resumeText.length}字 | JD：{jdText.length}字
            </div>

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
            <StrategyAdvice strategy={result.application_strategy} score={result.overall_score} />

            {/* 和AI对话入口 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    有疑问？继续和 AI 聊聊
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    可以追问"这一部分怎么优化"、"为什么这个维度分数这么低"等
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowChat(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  打开对话
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== AI 对话面板 ========== */}
      {showChat && (
        <div className="absolute top-0 right-0 bottom-0 w-[370px] bg-white dark:bg-gray-900 border-l dark:border-gray-700 flex flex-col z-20 shadow-2xl">
          {/* 面板标题 */}
          <div className="shrink-0 px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold dark:text-white">AI 对话</h3>
                <p className="text-[10px] text-gray-400">基于本次分析结果</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 对话历史 */}
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-4">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isChatting && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      AI 思考中...
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* 快捷问题 */}
          {!chatMessages.length && !isChatting && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-400 mb-2">快捷问题：</p>
              <div className="flex flex-wrap gap-1">
                {[
                  '这一部分怎么优化？',
                  '为什么匹配度这么低？',
                  '给我一个简历话术改写',
                  '我应该先改哪个部分？',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 输入框 */}
          <div className="shrink-0 px-4 py-3 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <Textarea
                placeholder="问 AI：我应该怎么优化这一项？"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                className="resize-none text-sm min-h-[60px] max-h-[120px]"
                disabled={isChatting}
              />
              <Button
                size="sm"
                onClick={handleSendChat}
                disabled={!chatInput.trim() || isChatting}
                className="bg-blue-500 hover:bg-blue-600 text-white shrink-0 h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">按 Enter 发送，Shift+Enter 换行</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResumeOptimizer;
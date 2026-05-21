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

var AIResumeOptimizer = function() {
  var _a = useState(''), resumeText = _a[0], setResumeText = _a[1];
  var _b = useState(null), resumeFile = _b[0], setResumeFile = _b[1];
  var _c = useState(''), jdText = _c[0], setJdText = _c[1];
  var _d = useState(null), jdImage = _d[0], setJdImage = _d[1];
  var _e = useState(null), jdImagePreview = _e[0], setJdImagePreview = _e[1];
  var _f = useState(false), isAnalyzing = _f[0], setIsAnalyzing = _f[1];
  var _g = useState(null), result = _g[0], setResult = _g[1];
  var _h = useState(null), error = _h[0], setError = _h[1];
  var _j = useState(false), showChat = _j[0], setShowChat = _j[1];
  var _k = useState([]), chatMessages = _k[0], setChatMessages = _k[1];
  var _l = useState(''), chatInput = _l[0], setChatInput = _l[1];
  var _m = useState(false), isChatting = _m[0], setIsChatting = _m[1];
  var chatEndRef = useRef(null);

  var handleResumeFileSelect = function(file) {
    extractTextFromFile(file).then(function(text) {
      setResumeFile(file);
      setResumeText(text);
      toast.success('简历已解析，共 ' + text.length + ' 字');
    })["catch"](function(err) {
      toast.error(err.message || '简历解析失败');
    });
  };

  var handleJdImageSelect = function(file) {
    setJdImage(file);
    setJdText('');
  };

  var handleAnalyze = function() {
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
    analyzeResume({ resumeText: resumeText, jdText: jdText })
      .then(function(analysisResult) {
        setResult(analysisResult);
        setChatMessages([{
          role: 'assistant',
          content: '分析完成！匹配度 ' + analysisResult.overall_score + '分。\n\n基于本次分析，我可以帮你：\n细化某一条改写建议\n针对某个缺失项给出具体优化方案\n解释某个评分维度的判断依据\n帮你把简历话术改写得更有竞争力\n\n有什么想深入聊的，直接问我！',
        }]);
        toast.success('分析完成！');
      })
      ["catch"](function(err) {
        setError(err.message);
        toast.error('分析失败：' + err.message);
      })
      .finally(function() {
        setIsAnalyzing(false);
      });
  };

  var handleSendChat = function() {
    if (!chatInput.trim() || isChatting) return;
    if (!result) {
      toast.error('请先完成一次分析');
      return;
    }
    var question = chatInput.trim();
    setChatInput('');
    setIsChatting(true);
    setChatMessages(function(prev) { return prev.concat([{ role: 'user', content: question }]); });
    askAI(question, resumeText, jdText, result)
      .then(function(answer) {
        setChatMessages(function(prev) { return prev.concat([{ role: 'assistant', content: answer }]); });
      })
      ["catch"](function(err) {
        toast.error('AI 回复失败：' + err.message);
        setChatMessages(function(prev) { return prev.slice(0, -1); });
      })
      .finally(function() {
        setIsChatting(false);
      });
  };

  var handleReset = function() {
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

  useEffect(function() {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  var canAnalyze = (resumeText.trim() || resumeFile) && (jdText.trim() || jdImage);

  var chatEndRef = useRef(null);

  return React.createElement('div', { className: 'h-full flex flex-col overflow-hidden relative' },
    // Header
    React.createElement('div', { className: 'shrink-0 px-4 py-3 border-b bg-white dark:bg-gray-900 dark:border-gray-800 z-10' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center' },
            React.createElement(Sparkles, { className: 'h-4 w-4 text-white' }),
          React.createElement('div', null,
            React.createElement('h1', { className: 'text-lg font-bold dark:text-white' }, 'AI 简历优化'),
            React.createElement('p', { className: 'text-xs text-gray-400' }, '支持 PDF / DOCX · 真实 AI 分析 · 可追问')
          ),
        React.createElement('div', { className: 'flex gap-2' },
          result && React.createElement(Button, {
            variant: 'outline', size: 'sm',
            onClick: function() { return setShowChat(!showChat); },
            className: showChat ? 'bg-blue-50 dark:bg-blue-900 border-blue-300' : ''
          },
            React.createElement(MessageSquare, { className: 'h-4 w-4 mr-1' }),
            showChat ? '收起对话' : '和AI对话'
          ),
          result && React.createElement(Button, { variant: 'outline', size: 'sm', onClick: handleReset },
            React.createElement(RotateCcw, { className: 'h-4 w-4 mr-1' }),
            '重新分析'
          )
        )
    ),
    // Main content
    React.createElement('div', { className: 'flex-1 overflow-auto p-4' },
      !result ? (
        // Input phase
        React.createElement('div', { className: 'h-full flex flex-col gap-4' },
          React.createElement('div', { className: 'flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0' },
            React.createElement(ResumeInput, {
              value: resumeText, onChange: setResumeText, onFileSelect: handleResumeFileSelect
            }),
            React.createElement(JDInput, {
              value: jdText, onChange: setJdText,
              onImageSelect: handleJdImageSelect, onImagePreview: setJdImagePreview
            })
          ),
          React.createElement('div', { className: 'shrink-0 flex justify-center pb-4' },
            React.createElement(Button, {
              size: 'lg',
              onClick: handleAnalyze,
              disabled: isAnalyzing || !canAnalyze,
              className: 'px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
            },
              isAnalyzing
                ? React.createElement(React.Fragment, null,
                    React.createElement('div', { className: 'animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' }),
                    'AI 分析中... MiniMax 思考中'
                  )
                : React.createElement(React.Fragment, null,
                    React.createElement(Zap, { className: 'h-4 w-4 mr-2' }),
                    '开始 AI 分析'
                  )
            )
          )
        )
      ) : (
        // Result phase
        React.createElement('div', { className: 'space-y-4 max-w-4xl pb-8 pr-[380px] transition-all' },
          // Debug bar
          React.createElement('div', { className: 'text-xs text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-900 rounded p-2 font-mono' },
            'MiniMax-Text-01 模型 | 简历:' + resumeText.length + '字 | JD:' + jdText.length + '字'
          ),
          // Score + Dimension cards
          React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-4 gap-4' },
            React.createElement('div', { className: 'lg:col-span-1' },
              React.createElement(MatchScoreRing, { score: result.overall_score })
            ),
            React.createElement('div', { className: 'lg:col-span-3' },
              React.createElement(DimensionCards, { dimensionScores: result.dimension_scores })
            )
          ),
          // Tabs
          React.createElement(Tabs, { defaultValue: 'missing', className: 'w-full' },
            React.createElement(TabsList, { className: 'grid w-full grid-cols-3' },
              React.createElement(TabsTrigger, { value: 'matched', className: 'text-xs' },
                '✅ 匹配项 (' + (result.matched_items && result.matched_items.length) + ')'
              ),
              React.createElement(TabsTrigger, { value: 'missing', className: 'text-xs' },
                '⚠️ 缺失项 (' + (result.missing_items && result.missing_items.length) + ')'
              ),
              React.createElement(TabsTrigger, { value: 'rewrite', className: 'text-xs' },
                '✏️ 改写建议 (' + (result.rewritten_sections && result.rewritten_sections.length) + ')'
              )
            ),
            React.createElement(TabsContent, { value: 'matched' },
              React.createElement(MatchedItems, { items: result.matched_items })
            ),
            React.createElement(TabsContent, { value: 'missing' },
              React.createElement(MissingItems, { items: result.missing_items })
            ),
            React.createElement(TabsContent, { value: 'rewrite' },
              React.createElement(RewrittenSections, { sections: result.rewritten_sections })
            )
          ),
          // Strategy
          React.createElement(StrategyAdvice, { strategy: result.application_strategy, score: result.overall_score }),
          // Chat entry
          React.createElement('div', { className: 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800' },
            React.createElement('div', { className: 'flex items-center justify-between' },
              React.createElement('div', null,
                React.createElement('h3', { className: 'font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2' },
                  React.createElement(MessageSquare, { className: 'h-4 w-4 text-blue-500' }),
                  '有疑问？继续和 AI 聊聊'
                ),
                React.createElement('p', { className: 'text-xs text-gray-500 mt-1' },
                  '可以追问"这一部分怎么优化"、"为什么这个维度分数这么低"等'
              ),
              React.createElement(Button, {
                size: 'sm',
                onClick: function() { return setShowChat(true); },
                className: 'bg-blue-500 hover:bg-blue-600 text-white'
              },
                React.createElement(MessageSquare, { className: 'h-4 w-4 mr-1' }),
                '打开对话'
              )
            )
          )
        )
      )
    ),
    // Chat panel
    showChat && React.createElement('div', { className: 'absolute top-0 right-0 bottom-0 w-[370px] bg-white dark:bg-gray-900 border-l dark:border-gray-700 flex flex-col z-20 shadow-2xl' },
      // Chat header
      React.createElement('div', { className: 'shrink-0 px-4 py-3 border-b dark:border-gray-700 flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          React.createElement('div', { className: 'w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center' },
            React.createElement(Bot, { className: 'h-4 w-4 text-white' })
          ),
          React.createElement('div', null,
            React.createElement('h3', { className: 'text-sm font-semibold dark:text-white' }, 'AI 对话'),
            React.createElement('p', { className: 'text-[10px] text-gray-400' }, '基于本次分析结果')
          )
        ),
        React.createElement(Button, { variant: 'ghost', size: 'sm', onClick: function() { return setShowChat(false); } },
          React.createElement(X, { className: 'h-4 w-4' })
        )
      ),
      // Chat messages
      React.createElement(ScrollArea, { className: 'flex-1 px-4 py-3' },
        React.createElement('div', { className: 'space-y-4' },
          chatMessages.map(function(msg, index) {
            return React.createElement('div', {
              key: index,
              className: 'flex gap-2 ' + (msg.role === 'user' ? 'flex-row-reverse' : '')
            },
              React.createElement('div', {
                className: 'w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ' +
                  (msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white')
              },
                msg.role === 'user'
                  ? React.createElement(User, { className: 'h-4 w-4' })
                  : React.createElement(Bot, { className: 'h-4 w-4' })
              ),
              React.createElement('div', {
                className: 'max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ' +
                  (msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'),
                style: { whiteSpace: 'pre-wrap' }
              }, msg.content)
            );
          }),
          isChatting && React.createElement('div', { className: 'flex gap-2' },
            React.createElement('div', { className: 'w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center' },
              React.createElement(Bot, { className: 'h-4 w-4 text-white' })
            ),
            React.createElement('div', { className: 'bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2' },
              React.createElement('div', { className: 'flex items-center gap-1 text-sm text-gray-400' },
                React.createElement(Loader2, { className: 'h-3 w-3 animate-spin' }),
                'AI 思考中...'
              )
            )
          ),
          React.createElement('div', { ref: chatEndRef })
        )
      ),
      // Quick questions
      !chatMessages.length && !isChatting && React.createElement('div', { className: 'px-4 pb-2' },
        React.createElement('p', { className: 'text-xs text-gray-400 mb-2' }, '快捷问题：'),
        React.createElement('div', { className: 'flex flex-wrap gap-1' },
          ['这一部分怎么优化？', '为什么匹配度这么低？', '给我一个简历话术改写', '我应该先改哪个部分？'].map(function(q) {
            return React.createElement('button', {
              key: q,
              onClick: function() { setChatInput(q); },
              className: 'text-xs bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-600 dark:text-gray-300 rounded-full px-2 py-1 transition-colors'
            }, q);
          })
        )
      ),
      // Input
      React.createElement('div', { className: 'shrink-0 px-4 py-3 border-t dark:border-gray-700' },
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement(Textarea, {
            placeholder: '问 AI：我应该怎么优化这一项？',
            value: chatInput,
            onChange: function(e) { return setChatInput(e.target.value); },
            onKeyDown: function(e) {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChat();
              }
            },
            className: 'resize-none text-sm min-h-[60px] max-h-[120px]',
            disabled: isChatting
          }),
          React.createElement(Button, {
            size: 'sm',
            onClick: handleSendChat,
            disabled: !chatInput.trim() || isChatting,
            className: 'bg-blue-500 hover:bg-blue-600 text-white shrink-0 h-auto',
            style: { alignSelf: 'flex-end' }
          },
            React.createElement(Send, { className: 'h-4 w-4' })
          )
        ),
        React.createElement('p', { className: 'text-[10px] text-gray-400 mt-1' }, '按 Enter 发送，Shift+Enter 换行')
      )
    )
  );
};

export default AIResumeOptimizer;

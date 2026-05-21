/**
 * MiniMax API - 简历优化对话系统
 * 模型: minimax-m2.7 (支持推理思考 + 正常回复)
 * 端点: /v1/text/chatcompletion_v2
 *
 * minimax-m2.7 返回格式:
 *   - message.content         → AI 正式回复
 *   - message.reasoning_content → 模型思考过程（推理链）
 */

import { mockAnalysisResult } from '@/lib/mockData';

const MINIMAX_API_KEY = 'sk-cp-WEOlm-bdy3xk3fauyBAkpPAcmc9RBUd7ZjizdjF2gRrjNPG3eBR6KaEohQp3NFZPqu9VV5ij6kMva8_cWG6jNVYgMopzfqeyH_pgvrx79vHgsW9SYVnHoLw';
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// 对话历史（维护完整上下文）
let chatMessages = [];

/**
 * 调用 MiniMax API（minimax-m2.7）
 */
async function callMiniMax(systemPrompt, userPrompt) {
  const startTime = Date.now();

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + MINIMAX_API_KEY,
    },
    body: JSON.stringify({
      model: 'minimax-m2.7',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  const latency = Date.now() - startTime;
  console.log('[MiniMax API] 响应时间:', latency + 'ms');

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[MiniMax API] HTTP 错误:', response.status, errorText);
    throw new Error('API 调用失败 (' + response.status + '): ' + errorText);
  }

  const data = await response.json();
  console.log('[MiniMax API] 原始响应 keys:', Object.keys(data));

  const choice = data.choices?.[0];
  if (!choice) {
    console.error('[MiniMax API] choices 为空:', JSON.stringify(data).slice(0, 300));
    throw new Error('API 返回数据异常: choices 为空');
  }

  const message = choice.message || {};
  const content = message.content || '';
  const reasoning = message.reasoning_content || '';

  console.log('[MiniMax API] 解析结果:');
  console.log('  - content 长度:', content.length, '字');
  console.log('  - reasoning 长度:', reasoning.length, '字');
  console.log('  - finish_reason:', choice.finish_reason);
  console.log('  - content 前100字:', content.slice(0, 100));

  if (!content.trim() && !reasoning.trim()) {
    throw new Error('AI 回复为空，可能原因：(1) Token 不足 (2) 模型服务暂时不可用 (3) 内容触发安全审核');
  }

  return { content, reasoning };
}

/**
 * 构建分析系统提示
 */
function buildAnalysisSystem() {
  return '你是一位资深AI产品经理兼求职顾问，专精于简历优化与职位匹配分析。\n\n## 核心能力\n1. 精准提取 JD 核心要求（3-5条）\n2. 深度匹配简历与 JD 的各项要求\n3. 给出具体、可操作的改写建议（不是泛泛而谈）\n4. 量化成果表述优化\n\n## 评分维度（权重）\n- 工作经验（30%）\n- 技能要求（30%）\n- 项目经历（25%）\n- 软性要求（15%）\n\n## 评分标准\n- 90-100：完全匹配，可直接投递\n- 75-89：大部分匹配，需小幅调整\n- 60-74：部分匹配，需针对性改写\n- 40-59：差距较大，建议补充经历\n- <40：不建议投递\n\n## 输出格式（必须严格 JSON，不要输出任何 JSON 之外的内容）\n{\n  "overall_score": 数字,\n  "dimension_scores": {\n    "experience": {"score": 数字, "analysis": "分析"},\n    "skills": {"score": 数字, "analysis": "分析"},\n    "projects": {"score": 数字, "analysis": "分析"},\n    "soft_skills": {"score": 数字, "analysis": "分析"}\n  },\n  "matched_items": [{"requirement": "要求", "evidence": "简历证据", "strength": "强/中/弱"}],\n  "missing_items": [{"requirement": "要求", "priority": "高/中/低", "suggestion": "具体建议"}],\n  "rewritten_sections": [{"section": "部分", "original": "原文", "improved": "改写", "reason": "原因"}],\n  "application_strategy": "策略建议"\n}';
}

/**
 * 构建对话系统提示
 */
function buildChatSystem() {
  return '你是一位资深AI产品经理兼求职顾问，正在帮助用户优化简历。\n\n## 你的角色\n- 深度理解用户的问题和简历内容\n- 给出具体、可操作的回答，不说废话\n- 每次回答都要引用简历原文或 JD 原文作为证据\n- 如果用户问改写，给出可以直接用的简历话术\n\n## 回答风格\n- 回答有深度，体现专业经验\n- 先理解用户具体问的是哪个部分\n- 结合简历原文和 JD 要求，给出针对性建议\n\n## 重要原则\n- 不要说"建议加强XX能力"这种废话，要说具体怎么做\n- 如果某个问题无法基于现有材料回答，直接说明\n- 每次回答末尾可以附上具体的简历改写建议（如果适用）';
}

/**
 * 分析简历与 JD 匹配度
 */
export async function analyzeResume({ resumeText, jdText }) {
  chatMessages = [];

  console.log('[AI Resume] 开始分析...');
  console.log('[AI Resume] 简历长度:', resumeText.length, '字');
  console.log('[AI Resume] JD 长度:', jdText.length, '字');

  const userPrompt = '## 简历内容\n' + resumeText + '\n\n## 岗位 JD\n' + jdText + '\n\n请严格按上述 JSON 格式输出分析结果。';

  try {
    const { content, reasoning } = await callMiniMax(buildAnalysisSystem(), userPrompt);

    console.log('[AI Resume] API 调用成功，尝试解析 JSON...');

    let result = null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[0]);
        console.log('[AI Resume] JSON 解析成功, score:', result.overall_score);
      } catch (e) {
        console.warn('[AI Resume] JSON 解析失败:', e.message);
      }
    }

    if (!result) {
      result = {
        ...mockAnalysisResult,
        raw_ai_response: content,
        reasoning_content: reasoning,
        overall_score: 75,
        parse_error: true,
      };
      console.log('[AI Resume] 使用 fallback 数据');
    }

    chatMessages = [
      { role: 'user', content: userPrompt },
      { role: 'assistant', content },
    ];

    return result;
  } catch (err) {
    console.error('[AI Resume] 分析失败:', err.message);
    throw err;
  }
}

/**
 * 追问 AI（对话模式）
 */
export async function askAI(question, resumeText, jdText, analysisResult) {
  console.log('[AI Chat] 追问:', question.slice(0, 100));

  const contextPrompt = '## 背景信息\n\n用户简历：\n' + resumeText + '\n\n岗位 JD：\n' + jdText + '\n\n上次分析结果摘要：\n- 总体匹配度：' + analysisResult.overall_score + '分\n- 匹配项：' + (analysisResult.matched_items || []).length + '项\n- 缺失项：' + (analysisResult.missing_items || []).length + '项\n- 改写建议：' + (analysisResult.rewritten_sections || []).length + '条\n\n## 用户的问题\n"' + question + '"\n\n请结合背景信息和简历原文，给出专业、具体的回答。';

  try {
    const { content, reasoning } = await callMiniMax(buildChatSystem(), contextPrompt);

    chatMessages.push({ role: 'user', content: question });
    chatMessages.push({ role: 'assistant', content });

    console.log('[AI Chat] 回复成功, 长度:', content.length, '字');

    if (reasoning && reasoning.trim()) {
      console.log('[AI Chat] 思考过程:', reasoning.slice(0, 200));
    }

    return content;
  } catch (err) {
    console.error('[AI Chat] 追问失败:', err.message);
    throw err;
  }
}

/**
 * 从文件提取文本
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  console.log('[extractTextFromFile] 文件:', fileName, '类型:', fileType);

  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await file.text();
    if (!text.trim()) throw new Error('TXT 文件内容为空');
    return text;
  }

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractPDF(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractDOCX(file);
  }

  if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
    throw new Error('图片文件请使用"JD 图片模式"上传，AI 会自动识别');
  }

  throw new Error('不支持的格式: ' + (fileType || fileName) + '。请上传 TXT、PDF 或 DOCX 文件。');
}

/**
 * PDF 提取（pdf.js CDN）
 */
async function extractPDF(file) {
  await ensureCDNLoaded('pdfjs');

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(function(item) { return item.str; }).join(' ');
    fullText += pageText + '\n';
  }

  if (!fullText.trim()) {
    throw new Error('PDF 中未提取到文字（可能是扫描图片型 PDF）。建议：(1) 将 PDF 另存为文字型 (2) 直接复制内容粘贴到文本框');
  }

  console.log('[extractPDF] 提取成功:', fullText.length, '字');
  return fullText;
}

/**
 * DOCX 提取（mammoth CDN）
 */
async function extractDOCX(file) {
  await ensureCDNLoaded('mammoth');

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer });

  if (!result.value.trim()) {
    throw new Error('Word 文档提取文字失败。可能原因：(1) 文档是图片型 (2) 有密码保护。请直接复制内容粘贴到文本框。');
  }

  console.log('[extractDOCX] 提取成功:', result.value.length, '字');
  return result.value;
}

/**
 * 懒加载 CDN 脚本
 */
var cdnLoaded = { pdfjs: false, mammoth: false };

function ensureCDNLoaded(lib) {
  if (cdnLoaded[lib]) return Promise.resolve();

  return new Promise(function(resolve, reject) {
    if (lib === 'pdfjs') {
      if (window.pdfjsLib) { cdnLoaded.pdfjs = true; resolve(); return; }
      var worker = document.createElement('script');
      worker.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      worker.onerror = function() { reject(new Error('PDF.js worker 加载失败')); };
      var main = document.createElement('script');
      main.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      main.onload = function() {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        cdnLoaded.pdfjs = true;
        resolve();
      };
      main.onerror = function() { reject(new Error('PDF.js 加载失败')); };
      document.head.appendChild(worker);
      document.head.appendChild(main);
    } else if (lib === 'mammoth') {
      if (window.mammoth) { cdnLoaded.mammoth = true; resolve(); return; }
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.12.0/mammoth.browser.min.js';
      script.onload = function() { cdnLoaded.mammoth = true; resolve(); };
      script.onerror = function() { reject(new Error('mammoth.js 加载失败，请检查网络')); };
      document.head.appendChild(script);
    }
  });
}

export function isImageFile(file) {
  var t = file.type;
  return t.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.name);
}

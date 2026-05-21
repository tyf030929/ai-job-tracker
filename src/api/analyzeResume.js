/**
 * MiniMax API - 简历优化对话系统
 * 支持连续对话、追问、全局上下文
 */

import { mockAnalysisResult } from '@/lib/mockData';

const MINIMAX_API_KEY = 'sk-cp-WEOlm-bdy3xk3fauyBAkpPAcmc9RBUd7ZjizdjF2gRrjNPG3eBR6KaEohQp3NFZPqu9VV5ij6kMva8_cWG6jNVYgMopzfqeyH_pgvrx79vHgsW9SYVnHoLw';
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

// 全局对话历史（分析场景内共享）
let chatHistory = [];

/**
 * 完整的简历分析 Prompt（包含所有 Skills 上下文）
 */
function buildAnalysisPrompt(resumeText, jdText) {
  return `你是一位资深AI产品经理兼求职顾问，专精于简历优化与职位匹配分析。

## 评估维度（权重）
- 工作经验（30%）：年限、行业、职责匹配度
- 技能要求（30%）：硬技能覆盖度
- 项目经历（25%）：项目复杂度、成果相关性
- 软性要求（15%）：沟通、团队、管理能力

## 评分标准
- 90-100：核心要求完全匹配，可直接投递
- 75-89：大部分匹配，需小幅调整简历
- 60-74：部分匹配，需要针对性改写关键经历
- 40-59：差距较大，建议补充相关经历
- <40：不建议投递

## 分析要求
请逐步分析（先列出思考过程，再给出结论）：
1. JD 的核心要求提取（3-5条）
2. 简历与每条要求的匹配度分析
3. 缺失项优先级排序
4. 简历改写建议（含具体话术）

## 输出格式（严格 JSON）
{
  "overall_score": 数字,
  "dimension_scores": {
    "experience": {"score": 数字, "analysis": "分析"},
    "skills": {"score": 数字, "analysis": "分析"},
    "projects": {"score": 数字, "analysis": "分析"},
    "soft_skills": {"score": 数字, "analysis": "分析"}
  },
  "matched_items": [{"requirement": "要求", "evidence": "简历证据", "strength": "强/中/弱"}],
  "missing_items": [{"requirement": "要求", "priority": "高/中/低", "suggestion": "建议"}],
  "rewritten_sections": [{"section": "部分", "original": "原文", "improved": "改写", "reason": "原因"}],
  "application_strategy": "策略建议"
}

## 简历内容
${resumeText}

## 岗位JD
${jdText}`;
}

/**
 * 追问/对话 Prompt（含分析结果上下文 + Skills）
 */
function buildChatPrompt(userQuestion, resumeText, jdText, analysisResult) {
  const previousAnalysis = JSON.stringify(analysisResult, null, 2);

  return `你是一位资深AI产品经理兼求职顾问，正在帮助用户优化简历。

## 当前分析结果（已完成）
${previousAnalysis}

## 用户原始简历
${resumeText}

## 岗位 JD
${jdText}

## 用户追问
"${userQuestion}"

## 回答要求
1. 先理解用户具体问的是哪个部分（匹配项/缺失项/改写建议/策略）
2. 结合简历原文和 JD 要求，给出具体、可操作的建议
3. 如果用户问改写，给出具体话术而非泛泛而谈
4. 每次回答都要引用具体证据（简历原文或 JD 原文）
5. 格式：先用 Markdown 给出结构化回答，然后附上对应的简历改写建议（如果有）

注意：回答要有深度，体现专业经验，不要只说"建议加强"这种废话。`;
}

/**
 * 分析简历与 JD 匹配度（主分析）
 */
export async function analyzeResume({ resumeText, jdText }) {
  // 重置对话历史
  chatHistory = [
    { role: 'user', content: buildAnalysisPrompt(resumeText, jdText) }
  ];

  console.log('[AI Resume] 开始调用 MiniMax API...');
  console.log('[AI Resume] 模型: MiniMax-Text-01');
  console.log('[AI Resume] 简历长度:', resumeText.length, '字');
  console.log('[AI Resume] JD长度:', jdText.length, '字');

  try {
    const result = await callMiniMaxAPI(buildAnalysisPrompt(resumeText, jdText), resumeText, jdText);
    console.log('[AI Resume] API 返回结果:', JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('[AI Resume] API 调用失败:', err);
    throw err;
  }
}

/**
 * 追问 AI（对话模式）
 */
export async function askAI(userQuestion, resumeText, jdText, analysisResult) {
  // 添加用户问题到历史
  chatHistory.push({ role: 'user', content: userQuestion });

  console.log('[AI Chat] 追问:', userQuestion);

  const prompt = buildChatPrompt(userQuestion, resumeText, jdText, analysisResult);

  // 添加 system context 作为新的 user message
  const fullPrompt = `你是一位资深AI产品经理兼求职顾问，正在帮助用户优化简历。

当前简历和 JD 已提供，用户刚刚完成了一次分析。
现在用户有以下问题，请结合之前的分析结果和简历内容作答：

用户问题: "${userQuestion}"

---
用户简历:
${resumeText}

---
岗位JD:
${jdText}

---
上次分析结果摘要:
- 匹配度: ${analysisResult.overall_score}分
- 匹配项: ${analysisResult.matched_items?.length || 0}项
- 缺失项: ${analysisResult.missing_items?.length || 0}项
- 改写建议: ${analysisResult.rewritten_sections?.length || 0}条

请给出专业、具体、有深度的回答。`;

  try {
    const result = await callMiniMaxAPIText(fullPrompt);
    // 添加 AI 回答到历史
    chatHistory.push({ role: 'assistant', content: result });
    console.log('[AI Chat] AI 回答长度:', result.length, '字');
    return result;
  } catch (err) {
    console.error('[AI Chat] 追问失败:', err);
    throw err;
  }
}

/**
 * 调用 MiniMax API（返回结构化 JSON）
 */
async function callMiniMaxAPI(prompt, resumeText, jdText) {
  const startTime = Date.now();

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });

  const latency = Date.now() - startTime;
  console.log('[API] 响应时间:', latency + 'ms');

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[API] HTTP 错误:', response.status, errorText);
    throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  console.log('[API] 原始回复长度:', content.length, '字');
  console.log('[API] 回复前200字:', content.slice(0, 200));

  // 解析 JSON
  try {
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      // 确保所有必要字段存在
      return {
        overall_score: parsed.overall_score || 70,
        dimension_scores: parsed.dimension_scores || mockAnalysisResult.dimension_scores,
        matched_items: parsed.matched_items || [],
        missing_items: parsed.missing_items || [],
        rewritten_sections: parsed.rewritten_sections || [],
        application_strategy: parsed.application_strategy || '建议根据缺失项优化后投递',
      };
    }
  } catch (parseError) {
    console.warn('[API] JSON 解析失败，尝试使用原始回复:', parseError.message);
  }

  // 解析失败，返回 mock + 原始回复
  return {
    ...mockAnalysisResult,
    raw_ai_response: content,
    overall_score: 72,
    message: '⚠️ AI 返回格式异常，已显示原始回复',
  };
}

/**
 * 调用 MiniMax API（返回纯文本，用于对话）
 */
async function callMiniMaxAPIText(prompt) {
  const startTime = Date.now();

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2048,
    }),
  });

  const latency = Date.now() - startTime;
  console.log('[Chat API] 响应时间:', latency + 'ms');

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  if (!content.trim()) {
    throw new Error('AI 回复为空，请稍后重试');
  }

  return content;
}

/**
 * 从各种格式文件中提取文本
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // 文本文件
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await file.text();
    if (!text.trim()) throw new Error('TXT 文件内容为空');
    return text;
  }

  // PDF 文件
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  }

  // Word 文件
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractTextFromDOCX(file);
  }

  // 图片文件（不是文本）
  if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)) {
    throw new Error('图片文件请使用"JD 图片模式"上传，AI 会自动识别图片中的文字');
  }

  throw new Error(`不支持的文件格式: ${fileType || fileName}`);
}

/**
 * 从 PDF 提取文本（PDF.js CDN）
 */
async function extractTextFromPDF(file) {
  // 等待 PDF.js 加载
  await ensurePDFJSLoaded();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  if (!fullText.trim()) {
    throw new Error('PDF 中未提取到文字（可能是扫描图片型 PDF）。请将 PDF 另存为文字型，或直接复制内容粘贴到文本框。');
  }

  return fullText;
}

/**
 * 从 DOCX 提取文本（mammoth.js CDN）
 */
async function extractTextFromDOCX(file) {
  // 等待 mammoth.js 加载
  await ensureMammothLoaded();

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });
  const text = result.value;

  if (!text.trim()) {
    throw new Error('Word 文档中未提取到文字。可能原因：(1) 文档是图片型 (2) 文档有密码保护。请直接复制文字内容粘贴到下方文本框。');
  }

  return text;
}

/**
 * 确保 PDF.js CDN 已加载
 */
function ensurePDFJSLoaded() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve();
      return;
    }

    const workerScript = document.createElement('script');
    workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    workerScript.onerror = () => reject(new Error('PDF.js worker 加载失败'));

    const mainScript = document.createElement('script');
    mainScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    mainScript.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    mainScript.onerror = () => reject(new Error('PDF.js 主库加载失败'));

    document.head.appendChild(workerScript);
    document.head.appendChild(mainScript);
  });
}

/**
 * 确保 mammoth.js CDN 已加载
 */
function ensureMammothLoaded() {
  return new Promise((resolve, reject) => {
    if (window.mammoth) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.12.0/mammoth.browser.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('mammoth.js 加载失败，请检查网络连接'));
    document.head.appendChild(script);
  });
}

/**
 * 检查是否是图片文件
 */
export function isImageFile(file) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  return (
    fileType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
  );
}
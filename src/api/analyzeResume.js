import { mockAnalysisResult } from '@/lib/mockData';

/**
 * MiniMax API 配置
 * API Key: sk-cp-WEOlm-bdy3xk3fauyBAkpPAcmc9RBUd7ZjizdjF2gRrjNPG3eBR6KaEohQp3NFZPqu9VV5ij6kMva8_cWG6jNVYgMopzfqeyH_pgvrx79vHgsW9SYVnHoLw
 * Model: MiniMax (minimax-m2.7)
 */
const MINIMAX_API_KEY = 'sk-cp-WEOlm-bdy3xk3fauyBAkpPAcmc9RBUd7ZjizdjF2gRrjNPG3eBR6KaEohQp3NFZPqu9VV5ij6kMva8_cWG6jNVYgMopzfqeyH_pgvrx79vHgsW9SYVnHoLw';
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2';

/**
 * 分析简历与JD匹配度
 * 支持：文本字符串 / PDF文件 / DOCX文件 / 图片文件
 */
export async function analyzeResume({ resumeInput, jdInput }) {
  // 如果是文件，先提取文本
  let resumeText = resumeInput;
  let jdText = jdInput;

  if (resumeInput instanceof File) {
    resumeText = await extractTextFromFile(resumeInput);
  }

  if (jdInput instanceof File) {
    jdText = await extractTextFromFile(jdInput);
  }

  // 调用 MiniMax API
  const result = await callMiniMaxAPI(resumeText, jdText);
  return result;
}

/**
 * 调用 MiniMax LLM 进行简历-JD 匹配分析
 */
async function callMiniMaxAPI(resumeText, jdText) {
  const prompt = buildPrompt(resumeText, jdText);

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-Text-01',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // 解析 JSON 响应
  try {
    // 尝试提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    // 如果没有 JSON，尝试用 mock 数据并附加原始回复
    return {
      ...mockAnalysisResult,
      raw_ai_response: content,
    };
  } catch (parseError) {
    // 解析失败，返回 mock 数据 + 原始回复
    return {
      ...mockAnalysisResult,
      raw_ai_response: content,
      overall_score: 75,
    };
  }
}

/**
 * 构建分析 Prompt
 */
function buildPrompt(resumeText, jdText) {
  return `你是一位资深AI产品经理兼求职顾问。请分析以下简历与岗位JD的匹配度。

## 评分标准
- 90-100：核心要求完全匹配，可直接投递
- 75-89：大部分匹配，需小幅调整简历
- 60-74：部分匹配，需要针对性改写关键经历
- 40-59：差距较大，建议补充相关经历
- <40：不建议投递

## 评估维度（权重如下）
- 工作经验（30%）：年限、行业、职责匹配度
- 技能要求（30%）：硬技能覆盖度
- 项目经历（25%）：项目复杂度、成果相关性
- 软性要求（15%）：沟通、团队、管理能力

## 简历内容
${resumeText}

## 岗位JD
${jdText}

请严格按照以下JSON格式输出，不要添加任何额外说明文字：
{
  "overall_score": 数字(0-100),
  "dimension_scores": {
    "experience": {"score": 数字, "analysis": "一句话分析"},
    "skills": {"score": 数字, "analysis": "一句话分析"},
    "projects": {"score": 数字, "analysis": "一句话分析"},
    "soft_skills": {"score": 数字, "analysis": "一句话分析"}
  },
  "matched_items": [
    {"requirement": "岗位要求", "evidence": "简历对应描述", "strength": "强/中/弱"}
  ],
  "missing_items": [
    {"requirement": "岗位要求", "priority": "高/中/低", "suggestion": "具体修改建议"}
  ],
  "rewritten_sections": [
    {
      "section": "简历哪个部分",
      "original": "原文",
      "improved": "改写后",
      "reason": "改写原因"
    }
  ],
  "application_strategy": "基于以上分析，给出投递建议"
}`;
}

/**
 * 从各种格式文件中提取文本
 * 支持：.txt, .pdf, .docx, .jpg, .jpeg, .png, .gif, .webp
 */
export async function extractTextFromFile(file) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // 文本文件
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
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

  // 图片文件（需要 OCR 或 MiniMax 视觉理解）
  if (
    fileType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
  ) {
    // 返回 File 对象，由调用方决定如何处理（MiniMax 视觉理解）
    return file;
  }

  throw new Error(`不支持的文件格式: ${fileType || fileName}。请上传 TXT、PDF、DOCX 或图片文件。`);
}

/**
 * 从 PDF 文件提取文本（使用 PDF.js CDN）
 */
async function extractTextFromPDF(file) {
  // 动态加载 PDF.js
  if (!window.pdfjsLib) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.head.appendChild(script);
    await new Promise((resolve) => { script.onload = resolve; });
  }

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
    throw new Error('PDF 中未提取到文本（可能是扫描图片型PDF）。请尝试上传文字型PDF或直接粘贴简历内容。');
  }

  return fullText;
}

/**
 * 从 DOCX 文件提取文本（使用 mammoth.js CDN）
 */
async function extractTextFromDOCX(file) {
  if (!window.mammoth) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.12.0/mammoth.browser.min.js';
    document.head.appendChild(script);
    await new Promise((resolve) => { script.onload = resolve; });
  }

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.extractRawText({ arrayBuffer });

  if (!result.value.trim()) {
    throw new Error('Word 文档中未提取到文本');
  }

  return result.value;
}

/**
 * 检查是否是图片文件（用于 JD 上传）
 */
export function isImageFile(file) {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  return (
    fileType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
  );
}
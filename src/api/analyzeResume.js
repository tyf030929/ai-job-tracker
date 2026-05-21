import { useState } from 'react';
import { mockAnalysisResult } from '@/lib/mockData';

const API_ENDPOINT = '/api/analyze-resume';

/**
 * 分析简历与JD匹配度
 * 开发阶段使用Mock数据，后续替换为真实API调用
 */
export async function analyzeResume(resumeText, jdText) {
  // 开发阶段：使用Mock数据
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  // 模拟根据输入内容微调评分
  const result = { ...mockAnalysisResult };
  const resumeLength = resumeText.length;
  const jdLength = jdText.length;

  // 简历越长，经验分略高
  if (resumeLength > 2000) {
    result.dimension_scores.experience.score = Math.min(85, result.dimension_scores.experience.score + 10);
  }
  // JD越详细，分析越具体
  if (jdLength > 500) {
    result.dimension_scores.skills.analysis += "（基于详细JD分析）";
  }

  // 重新计算总分
  const weights = { experience: 0.3, skills: 0.3, projects: 0.25, soft_skills: 0.15 };
  result.overall_score = Math.round(
    result.dimension_scores.experience.score * weights.experience +
    result.dimension_scores.skills.score * weights.skills +
    result.dimension_scores.projects.score * weights.projects +
    result.dimension_scores.soft_skills.score * weights.soft_skills
  );

  return result;

  // 真实API调用（取消注释后使用）
  // const response = await fetch(API_ENDPOINT, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ resume: resumeText, jd: jdText }),
  // });
  // if (!response.ok) throw new Error('分析失败，请稍后重试');
  // return response.json();
}

/**
 * 从文件中提取文本（支持txt格式）
 */
export function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    if (file.type !== 'text/plain') {
      reject(new Error('目前仅支持TXT格式，请将简历内容粘贴到文本框中'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

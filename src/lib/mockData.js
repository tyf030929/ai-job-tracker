export const mockAnalysisResult = {
  overall_score: 72,
  dimension_scores: {
    experience: { score: 65, analysis: "2年产品经验，未达3年要求；但项目密度较高，2年内主导2个完整产品周期，可部分弥补年限差距" },
    skills: { score: 78, analysis: "SQL/Python数据处理能力满足要求，Streamlit部署经验扎实；AI相关技能需补充LLM实战经验" },
    projects: { score: 70, analysis: "两个从0到1项目经验扎实，代谢物分析平台有明确量化成果；但AI技术深度不够，需突出LLM应用" },
    soft_skills: { score: 75, analysis: "有院团委部长管理经验，跨部门协作能力可进一步强化描述" },
  },
  matched_items: [
    { requirement: "数据分析能力", evidence: "Python/SQL数据处理，数据驱动迭代，单次分析效率提升99%", strength: "强" },
    { requirement: "从0到1产品经验", evidence: "独立主导两个从0到1产品：代谢物分析平台 + 求职管理看板", strength: "强" },
    { requirement: "AI工具应用", evidence: "熟练使用Claude Code、ChatGPT等AI工具辅助需求拆解、方案设计与代码实现", strength: "中" },
    { requirement: "需求调研能力", evidence: "通过1v1访谈与流程观察梳理6大环节，诊断三大瓶颈", strength: "强" },
    { requirement: "Web端产品设计", evidence: "Streamlit零安装部署，四步简化流程，无编程基础用户可独立完成", strength: "中" },
  ],
  missing_items: [
    { requirement: "3年以上产品经验", priority: "高", suggestion: "建议强调项目密度与成长速度：'2年内主导2个完整产品周期，覆盖需求调研→设计→开发→上线→迭代全流程，相当于传统路径3年经验密度'" },
    { requirement: "AI/LLM项目经验", priority: "高", suggestion: "建议将代谢物分析平台重写为AI项目：突出'构建LLM驱动的分子推荐引擎，通过Prompt Engineering实现top-N候选化合物的自动筛选与可解释推荐'" },
    { requirement: "B端SaaS产品经验", priority: "中", suggestion: "可强调Web端产品设计与部署经验的可迁移性，以及面向科研用户的B端思维" },
    { requirement: "跨部门沟通能力", priority: "低", suggestion: "在项目描述中补充'协调算法团队、运营团队'等协作细节，量化协作成果" },
  ],
  rewritten_sections: [
    {
      section: "项目经历 - 代谢物分析平台",
      original: "设计明星分子综合评分体系，将5项专家经验量化为12条可配置加权规则",
      improved: "构建LLM驱动的分子推荐引擎，将5项专家经验量化为12条可配置加权规则与3种预设策略，通过Prompt Engineering实现top-N候选化合物的自动筛选与可解释推荐",
      reason: "补充AI技术关键词（LLM、Prompt Engineering、可解释推荐），将规则引擎升级为AI驱动叙事，匹配JD中的AI/LLM经验要求"
    },
    {
      section: "项目经历 - 求职看板",
      original: "全程使用AI Coding工具加速UI布局与数据模型搭建",
      improved: "基于LLM的简历-岗位智能匹配分析，通过Prompt Engineering自动提取JD核心要求并与用户经历对齐，生成个性化优化建议与定制版简历",
      reason: "将'使用AI工具开发'升级为'构建AI功能产品'，展示从AI使用者到AI产品设计者的能力跃迁"
    },
  ],
  application_strategy: "建议修改简历后投递。核心差距在工作年限和AI项目深度，但两个从0到1的产品经验是强项。重点改写代谢物分析项目为AI叙事，补充LLM相关技术描述。预计改写后匹配度可从72分提升至80+分，达到'建议投递'门槛。",
};

export const mockHistoryData = [
  { id: 1, company: "字节跳动", position: "AI产品经理", score: 78, date: "2026-05-20", status: "已投递" },
  { id: 2, company: "腾讯", position: "数据产品经理", score: 65, date: "2026-05-18", status: "已投递" },
  { id: 3, company: "美团", position: "产品经理", score: 82, date: "2026-05-15", status: "面试中" },
  { id: 4, company: "小红书", position: "AI产品实习", score: 88, date: "2026-05-12", status: "已通过" },
];

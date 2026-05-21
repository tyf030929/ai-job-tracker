# AI 求职助手平台

> 🤖 AI 驱动的智能求职管理看板 + 简历优化助手

## 功能特性

### 📋 求职看板
- 12 阶段全生命周期追踪（投递 → 笔试 → 面试 → Offer）
- 9 种招聘渠道管理
- 拖拽交互，直观管理求职进度
- 材料清单与完成度追踪

### 📊 数据统计
- 阶段分布分析
- 渠道转化漏斗
- 薪资分布统计
- 各阶段平均停留天数

### 🤖 AI 简历优化（核心亮点）
- **简历-JD 智能匹配**：输入简历 + 岗位 JD，AI 自动分析匹配度
- **多维度评分**：工作经验、技能要求、项目经历、软性要求四维度打分
- **缺失项识别**：自动找出简历中未满足的岗位要求，附优先级和修改建议
- **简历改写建议**：针对低匹配部分，给出具体话术改写
- **投递策略推荐**：明确告诉你是该投、改了再投、还是不建议投

### 🎨 其他特性
- 日历视图（截止日期管理）
- 暗黑模式支持
- 响应式设计（移动端可用）
- CSV 数据导出

## 技术栈

- **前端框架**：React 18 + Vite
- **UI 组件**：shadcn/ui + Tailwind CSS
- **拖拽交互**：@dnd-kit
- **数据可视化**：Recharts
- **状态管理**：React Query + LocalStorage
- **AI 分析**：LLM 驱动的简历匹配引擎（Mock 数据，可接入 Claude/OpenAI API）

## 本地开发

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产版本
yarn build
```

## 部署

### Vercel（推荐）

1. Fork 本仓库到你的 GitHub
2. 登录 [Vercel](https://vercel.com)
3. Import Git Repository → 选择本仓库
4. 框架自动检测为 Vite，点击 Deploy 即可

### 手动部署

```bash
yarn build
# 将 build/ 目录部署到任意静态托管服务
```

## 项目结构

```
src/
├── api/
│   └── analyzeResume.js          # AI 分析 API 封装
├── components/
│   ├── ai-resume/                # AI 简历优化组件
│   │   ├── ResumeInput.jsx       # 简历输入
│   │   ├── JDInput.jsx           # JD 输入
│   │   ├── MatchScoreRing.jsx    # 匹配度环形图
│   │   ├── DimensionCards.jsx    # 维度评分卡片
│   │   ├── MatchedItems.jsx      # 匹配项列表
│   │   ├── MissingItems.jsx      # 缺失项列表
│   │   ├── RewrittenSections.jsx # 改写建议
│   │   └── StrategyAdvice.jsx    # 投递策略
│   ├── kanban/                   # 看板组件
│   ├── calendar/                 # 日历视图
│   ├── stats/                    # 统计面板
│   └── layout/                   # 布局组件
├── pages/
│   ├── Index.jsx                 # 主页面
│   └── AIResumeOptimizer.jsx     # AI 简历优化页面
└── lib/
    └── mockData.js               # Mock 分析数据
```

## License

MIT

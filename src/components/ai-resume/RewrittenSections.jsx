import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ArrowRight } from 'lucide-react';

const RewrittenSections = ({ sections }) => {
  // Default rewritten sections
  const defaultSections = [
    {
      section: '项目经历',
      original: '负责公司数据清洗和可视化工作',
      rewritten: '主导数据流水线重构，自动化处理日均 500 万条数据，可视化看板覆盖 10+ 业务场景',
      reason: '量化成果，增加说服力'
    },
    {
      section: '技能清单',
      original: '熟悉 Python、SQL、机器学习',
      rewritten: 'Python（3年）：Django/Flask 框架开发；SQL（精通）：复杂查询优化；机器学习：Scikit-learn、XGBoost',
      reason: '按技能熟练度和使用场景细化'
    },
    {
      section: '自我评价',
      original: '工作认真负责，善于学习',
      rewritten: '以数据驱动决策，通过 A/B 测试将转化率提升 23%；快速学习新技术，独立完成 React 全栈项目并上线',
      reason: '用具体案例替代空泛描述'
    }
  ];

  const rewrittenSections = sections || defaultSections;

  return (
    <Card className="border-yellow-200 dark:border-yellow-900">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/50">
            <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-base">改写建议</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          优化简历内容以更好地匹配职位要求
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rewrittenSections.map((item, index) => (
          <div
            key={index}
            className="space-y-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {item.section}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {item.reason}
              </span>
            </div>

            {/* Original */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">原文</span>
              <p className="text-sm line-through text-muted-foreground/70 bg-white/50 dark:bg-black/20 p-2 rounded">
                {item.original}
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <ArrowRight className="w-4 h-4 text-yellow-500 rotate-90" />
            </div>

            {/* Rewritten */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-green-600 dark:text-green-400">改写后</span>
              <p className="text-sm font-medium bg-white dark:bg-black/20 p-2 rounded border-l-2 border-green-500">
                {item.rewritten}
              </p>
            </div>
          </div>
        ))}

        {rewrittenSections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无改写建议</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RewrittenSections;
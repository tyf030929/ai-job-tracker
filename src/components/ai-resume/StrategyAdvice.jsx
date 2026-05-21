import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Clock, Filter } from 'lucide-react';

const StrategyAdvice = ({ strategies }) => {
  // Default strategy data
  const defaultStrategies = [
    {
      strategy: '精准投递',
      score: 88,
      description: '您的简历与该职位高度匹配，建议优先投递',
      reason: '匹配度超过 85%，获得面试机会概率较高'
    },
    {
      strategy: '优化后投递',
      score: 72,
      description: '匹配度一般，建议根据改写建议优化后再投递',
      reason: '优化后可提升至 85% 以上匹配度'
    },
    {
      strategy: '暂缓投递',
      score: 45,
      description: '匹配度较低，建议先积累相关经验后再尝试',
      reason: '缺少高优先级技能，需要 1-2 个月准备'
    }
  ];

  const adviceStrategies = strategies || defaultStrategies;

  const getStrategyIcon = (strategy) => {
    switch (strategy) {
      case '精准投递':
        return Target;
      case '优化后投递':
        return TrendingUp;
      case '暂缓投递':
        return Clock;
      default:
        return Filter;
    }
  };

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case '精准投递':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-300';
      case '优化后投递':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-300';
      case '暂缓投递':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300';
    }
  };

  // Find the best strategy (highest score)
  const bestStrategy = adviceStrategies.reduce((best, current) =>
    current.score > best.score ? current : best
  , adviceStrategies[0]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">投递策略建议</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          基于简历与职位匹配度分析
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Comparison Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">综合匹配度</span>
            <span className="font-bold text-primary">{bestStrategy.score}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
              style={{ width: `${bestStrategy.score}%` }}
            />
          </div>
        </div>

        {/* Strategy List */}
        <div className="space-y-3">
          {adviceStrategies.map((item, index) => {
            const Icon = getStrategyIcon(item.strategy);
            const colorClass = getStrategyColor(item.strategy);

            return (
              <div
                key={index}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  item === bestStrategy
                    ? 'ring-2 ring-primary/20'
                    : ''
                }`}
              >
                {/* Best Strategy Badge */}
                {item === bestStrategy && (
                  <Badge className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground">
                    推荐
                  </Badge>
                )}

                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClass.split(' ')[0]} ${colorClass.split(' ')[2]}`}>
                    <Icon className={`w-4 h-4 ${colorClass.split(' ')[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{item.strategy}</span>
                      <Badge className={`text-xs ${colorClass}`}>
                        {item.score}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 italic">
                      💡 {item.reason}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Hint */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            💡 建议：参考「改写建议」优化简历后再投递，可显著提升成功率
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategyAdvice;
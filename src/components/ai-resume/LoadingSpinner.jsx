import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'AI 正在分析中...', size = 'medium' }) => {
  const sizeConfig = {
    small: { icon: 24, spinner: 'w-6 h-6', text: 'text-xs' },
    medium: { icon: 40, spinner: 'w-10 h-10', text: 'text-sm' },
    large: { icon: 64, spinner: 'w-16 h-16', text: 'text-base' }
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      {/* Animated Robot Icon */}
      <div className="relative">
        <div className="animate-bounce">
          <Bot
            className={config.spinner}
            style={{ width: config.icon, height: config.icon }}
          />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-primary rounded-full" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-1.5 h-1.5 bg-primary/60 rounded-full" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '5s' }}>
          <div className="absolute top-1/2 right-0 translate-y-1/2 translate-x-1 w-1 h-1 bg-primary/40 rounded-full" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-1">
        <p className={`font-medium text-muted-foreground ${config.text}`}>
          {message}
        </p>
        <div className="flex items-center justify-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground/60">
            请稍候...
          </span>
        </div>
      </div>

      {/* Progress dots animation */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground/50 max-w-[200px] text-center">
        正在比对简历与职位描述，分析匹配度...
      </p>
    </div>
  );
};

export default LoadingSpinner;
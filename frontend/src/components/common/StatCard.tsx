import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'royal' | 'teal' | 'amber' | 'lavender';
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'royal',
  badgeText,
}) => {
  const colorMap = {
    royal: {
      bg: 'bg-royal/10',
      text: 'text-royal',
      badge: 'bg-royal-light text-royal',
      border: 'border-royal/20'
    },
    teal: {
      bg: 'bg-teal/10',
      text: 'text-teal',
      badge: 'bg-teal-light text-teal-dark',
      border: 'border-teal/20'
    },
    amber: {
      bg: 'bg-amber/10',
      text: 'text-amber',
      badge: 'bg-amber-light text-amber-dark',
      border: 'border-amber/20'
    },
    lavender: {
      bg: 'bg-lavender/10',
      text: 'text-lavender',
      badge: 'bg-lavender-light text-lavender',
      border: 'border-lavender/20'
    }
  };

  const style = colorMap[color];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-blue-100/70 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-content-muted tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-navy mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-content-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${style.bg} ${style.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${style.badge}`}>
            {badgeText}
          </span>
          <span className="text-content-subtle text-[11px]">Empirical BTS Benchmark</span>
        </div>
      )}
    </div>
  );
};

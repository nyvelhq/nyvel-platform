import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

/**
 * StatCard — dashboard metric display with trend indicator
 * Renders: icon + value + label + optional trend
 *
 * When `animate` is true and `value` is numeric, the value rolls up via
 * AnimatedCounter. Pass `format` (or prefix/suffix/decimals) to control
 * how the animated number is rendered. Otherwise behaves exactly as before.
 */
export default function StatCard({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  iconColor = 'brand',
  formatter,
  invert = false,
  animate = false,
  format,
  prefix,
  suffix,
  decimals,
}) {
  const canAnimate = animate && typeof value === 'number';
  const displayValue = formatter ? formatter(value) : value;

  // Semantic icon background colors (refined, more subtle)
  const iconColorMap = {
    brand: 'bg-brand-50/70 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    accent: 'bg-accent-50/70 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400',
    success: 'bg-success-50/70 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    warning: 'bg-warning-50/70 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    error: 'bg-error-50/70 dark:bg-error-900/20 text-error-600 dark:text-error-400',
    // Legacy aliases for backward compatibility
    teal: 'bg-brand-50/70 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    amber: 'bg-accent-50/70 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400',
    green: 'bg-success-50/70 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    red: 'bg-error-50/70 dark:bg-error-900/20 text-error-600 dark:text-error-400',
    blue: 'bg-brand-50/70 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    violet: 'bg-brand-50/70 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
    cyan: 'bg-brand-50/70 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400',
  };

  const hasTrend = trend !== undefined && trend !== null;
  const trendNeutral = hasTrend && trend === 0;
  // "invert" flags metrics where a decrease is good (e.g., open issues)
  const trendGood = hasTrend && (invert ? trend < 0 : trend > 0);
  const trendPositive = hasTrend && trend > 0;

  return (
    <div className="stat-card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              iconColorMap[iconColor] || iconColorMap.brand
            }`}
            aria-hidden="true"
          >
            <Icon size={20} />
          </div>
        )}
        {hasTrend && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-200 ${
              trendNeutral
                ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                : trendGood
                ? 'bg-success-50/70 dark:bg-success-900/20 text-success-600 dark:text-success-400'
                : 'bg-error-50/70 dark:bg-error-900/20 text-error-600 dark:text-error-400'
            }`}
            role="status"
            aria-label={`Trend: ${trendNeutral ? 'No change' : `${trendPositive ? 'up' : 'down'} ${Math.abs(trend)}${trendLabel || ''}`}`}
          >
            {trendNeutral ? (
              <Minus size={12} aria-hidden="true" />
            ) : trendPositive ? (
              <TrendingUp size={12} aria-hidden="true" />
            ) : (
              <TrendingDown size={12} aria-hidden="true" />
            )}
            <span>
              {trendNeutral ? 'No change' : `${trendPositive ? '+' : ''}${trend}${trendLabel || ''}`}
            </span>
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-slate-50 leading-none">
          {canAnimate ? (
            <AnimatedCounter
              value={value}
              format={format}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          ) : (
            displayValue
          )}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 font-medium">{label}</p>
      </div>
    </div>
  );
}

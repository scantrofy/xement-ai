import React from 'react';
import { Zap, TrendingDown, CheckCircle, Award, Activity, Target } from 'lucide-react';

const SummaryCards = ({ metrics, reportPeriod }) => {
  const cards = [
    {
      title: 'Avg Energy Use',
      value: `${metrics.avgEnergyUse}`,
      unit: 'kWh/ton',
      icon: Zap,
      color: 'text-blue-500 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Energy Savings',
      value: `${metrics.energySavings}`,
      unit: '%',
      icon: TrendingDown,
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Optimizations Applied',
      value: metrics.totalOptimizations,
      unit: 'actions',
      icon: CheckCircle,
      color: 'text-purple-500 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'CO₂ Reduction',
      value: `${metrics.co2Reduction}`,
      unit: '%',
      icon: Activity,
      color: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Efficiency Improvement',
      value: `${metrics.efficiencyImprovement}`,
      unit: '%',
      icon: Target,
      color: 'text-orange-500 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Quality Score',
      value: metrics.qualityScore,
      unit: '%',
      icon: Award,
      color: 'text-indigo-500 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 transition-all hover:shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-secondary mb-2">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </span>
                  <span className="text-sm text-text-secondary font-medium">
                    {card.unit}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor} border ${card.borderColor}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;

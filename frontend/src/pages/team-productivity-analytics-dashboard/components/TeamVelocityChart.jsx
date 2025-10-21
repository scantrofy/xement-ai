import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const TeamVelocityChart = ({ data, granularity, onGranularityChange }) => {
  const [selectedMetrics, setSelectedMetrics] = useState({
    commits: true,
    prs: true,
    reviews: true,
    velocity: true
  });

  const [overlayOptions, setOverlayOptions] = useState({
    releases: false,
    holidays: false,
    sprints: true
  });

  const granularityOptions = [
    { id: 'daily', name: 'Daily', icon: 'Calendar' },
    { id: 'weekly', name: 'Weekly', icon: 'CalendarDays' },
    { id: 'monthly', name: 'Monthly', icon: 'CalendarRange' }
  ];

  const metricConfig = {
    commits: { color: '#14B8A6', name: 'Commits' },
    prs: { color: '#6366F1', name: 'Pull Requests' },
    reviews: { color: '#F59E0B', name: 'Reviews' },
    velocity: { color: '#10B981', name: 'Velocity Score' }
  };

  const toggleMetric = (metric) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metric]: !prev?.[metric]
    }));
  };

  const toggleOverlay = (overlay) => {
    setOverlayOptions(prev => ({
      ...prev,
      [overlay]: !prev?.[overlay]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface border border-border-medium rounded-lg p-4 shadow-elevated">
          <p className="text-text-primary font-mono text-sm font-medium mb-2">
            {new Date(label)?.toLocaleDateString()}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-text-secondary font-mono text-xs">
                  {entry?.name}:
                </span>
              </div>
              <span className="text-text-primary font-mono text-xs font-medium">
                {entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Team Velocity Trends
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Multi-series tracking of development metrics over time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Granularity Selector */}
          <div className="flex bg-background border border-border-medium rounded-lg p-1">
            {granularityOptions?.map((option) => (
              <button
                key={option?.id}
                onClick={() => onGranularityChange(option?.id)}
                className={`flex items-center space-x-2 px-3 py-1 text-sm font-mono rounded transition-smooth ${
                  granularity === option?.id
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name={option?.icon} size={14} strokeWidth={2} />
                <span>{option?.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        {/* Metric Toggles */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-secondary font-mono">Metrics:</span>
          {Object.entries(metricConfig)?.map(([key, config]) => (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-smooth ${
                selectedMetrics?.[key]
                  ? 'border-border-medium bg-surface-light' :'border-border-light bg-background hover:bg-surface-light'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config?.color }}
              />
              <span className="text-sm font-mono text-text-primary">
                {config?.name}
              </span>
            </button>
          ))}
        </div>

        {/* Overlay Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-secondary font-mono">Overlays:</span>
          {Object.entries(overlayOptions)?.map(([key, enabled]) => (
            <button
              key={key}
              onClick={() => toggleOverlay(key)}
              className={`px-3 py-1 text-sm font-mono rounded-lg border transition-smooth ${
                enabled
                  ? 'border-primary bg-primary/10 text-primary' :'border-border-medium text-text-secondary hover:text-text-primary'
              }`}
            >
              {key?.charAt(0)?.toUpperCase() + key?.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
              tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '12px',
                color: '#F8FAFC'
              }}
            />
            
            {selectedMetrics?.commits && (
              <Line
                type="monotone"
                dataKey="commits"
                stroke={metricConfig?.commits?.color}
                strokeWidth={2}
                dot={{ fill: metricConfig?.commits?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: metricConfig?.commits?.color, strokeWidth: 2 }}
                name={metricConfig?.commits?.name}
              />
            )}
            
            {selectedMetrics?.prs && (
              <Line
                type="monotone"
                dataKey="prs"
                stroke={metricConfig?.prs?.color}
                strokeWidth={2}
                dot={{ fill: metricConfig?.prs?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: metricConfig?.prs?.color, strokeWidth: 2 }}
                name={metricConfig?.prs?.name}
              />
            )}
            
            {selectedMetrics?.reviews && (
              <Line
                type="monotone"
                dataKey="reviews"
                stroke={metricConfig?.reviews?.color}
                strokeWidth={2}
                dot={{ fill: metricConfig?.reviews?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: metricConfig?.reviews?.color, strokeWidth: 2 }}
                name={metricConfig?.reviews?.name}
              />
            )}
            
            {selectedMetrics?.velocity && (
              <Line
                type="monotone"
                dataKey="velocity"
                stroke={metricConfig?.velocity?.color}
                strokeWidth={2}
                dot={{ fill: metricConfig?.velocity?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: metricConfig?.velocity?.color, strokeWidth: 2 }}
                name={metricConfig?.velocity?.name}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Chart Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-medium">
        <div className="flex items-center space-x-4 text-sm text-text-secondary font-mono">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={16} strokeWidth={2} />
            <span>Overall trend: +12.3% this period</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Calendar" size={16} strokeWidth={2} />
            <span>Data range: Last 12 weeks</span>
          </div>
        </div>
        <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary-400 font-mono transition-smooth">
          <Icon name="Maximize2" size={16} strokeWidth={2} />
          <span>Full Screen</span>
        </button>
      </div>
    </div>
  );
};

export default TeamVelocityChart;
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('burndown');

  const tabs = [
    { id: 'burndown', name: 'Burndown', icon: 'TrendingDown' },
    { id: 'capacity', name: 'Capacity', icon: 'Users' },
    { id: 'forecast', name: 'Forecast', icon: 'TrendingUp' }
  ];

  // Mock data for burndown projections
  const burndownData = [
    { day: 1, ideal: 100, actual: 100, projected: 100 },
    { day: 2, ideal: 90, actual: 95, projected: 95 },
    { day: 3, ideal: 80, actual: 88, projected: 90 },
    { day: 4, ideal: 70, actual: 82, projected: 85 },
    { day: 5, ideal: 60, actual: 75, projected: 78 },
    { day: 6, ideal: 50, actual: 68, projected: 70 },
    { day: 7, ideal: 40, actual: 58, projected: 60 },
    { day: 8, ideal: 30, actual: 45, projected: 48 },
    { day: 9, ideal: 20, actual: 32, projected: 35 },
    { day: 10, ideal: 10, actual: 18, projected: 20 },
    { day: 11, ideal: 0, actual: null, projected: 8 },
    { day: 12, ideal: 0, actual: null, projected: 2 },
    { day: 13, ideal: 0, actual: null, projected: 0 }
  ];

  // Mock data for capacity planning
  const capacityData = [
    { week: 'Week 1', allocated: 85, available: 100, efficiency: 85 },
    { week: 'Week 2', allocated: 92, available: 100, efficiency: 88 },
    { week: 'Week 3', allocated: 78, available: 95, efficiency: 82 },
    { week: 'Week 4', allocated: 88, available: 100, efficiency: 90 },
    { week: 'Week 5', allocated: 95, available: 100, efficiency: 87 },
    { week: 'Week 6', allocated: 82, available: 90, efficiency: 91 }
  ];

  // Mock data for trend forecasting
  const forecastData = [
    { month: 'Jan', velocity: 85, forecast: 85, confidence: 95 },
    { month: 'Feb', velocity: 88, forecast: 88, confidence: 92 },
    { month: 'Mar', velocity: 92, forecast: 92, confidence: 89 },
    { month: 'Apr', velocity: 87, forecast: 87, confidence: 94 },
    { month: 'May', velocity: 94, forecast: 94, confidence: 91 },
    { month: 'Jun', velocity: null, forecast: 96, confidence: 78 },
    { month: 'Jul', velocity: null, forecast: 98, confidence: 72 },
    { month: 'Aug', velocity: null, forecast: 95, confidence: 68 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface border border-border-medium rounded-lg p-3 shadow-elevated">
          <p className="text-text-primary font-mono text-sm font-medium mb-2">
            {label}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 mb-1">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-text-secondary font-mono text-xs">
                  {entry?.name}:
                </span>
              </div>
              <span className="text-text-primary font-mono text-xs font-medium">
                {typeof entry?.value === 'number' ? entry?.value?.toFixed(1) : entry?.value}
                {entry?.dataKey === 'confidence' ? '%' : ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderBurndownChart = () => (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="day" 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              name="Projected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Target" size={14} className="text-primary" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Sprint Goal</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">82% Complete</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={14} className="text-warning" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Days Remaining</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">3 days</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={14} className="text-success" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Completion Trend</span>
          </div>
          <span className="text-sm font-bold text-success font-mono">On Track</span>
        </div>
      </div>
    </div>
  );

  const renderCapacityChart = () => (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={capacityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="week" 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="available" fill="#475569" name="Available" />
            <Bar dataKey="allocated" fill="#14B8A6" name="Allocated" />
            <Bar dataKey="efficiency" fill="#6366F1" name="Efficiency" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Users" size={14} className="text-primary" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Team Utilization</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">87.2%</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Zap" size={14} className="text-accent" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Avg Efficiency</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">87.8%</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="AlertTriangle" size={14} className="text-warning" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Overallocation Risk</span>
          </div>
          <span className="text-sm font-bold text-warning font-mono">Low</span>
        </div>
      </div>
    </div>
  );

  const renderForecastChart = () => (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={12}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="velocity"
              stroke="#14B8A6"
              strokeWidth={3}
              dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
              name="Actual Velocity"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
              name="Forecast"
            />
            <Line
              type="monotone"
              dataKey="confidence"
              stroke="#6366F1"
              strokeWidth={1}
              dot={{ fill: '#6366F1', strokeWidth: 1, r: 2 }}
              name="Confidence"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={14} className="text-success" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Trend Direction</span>
          </div>
          <span className="text-sm font-bold text-success font-mono">Positive</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="BarChart3" size={14} className="text-primary" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Forecast Accuracy</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">72.7%</span>
        </div>
        <div className="bg-background rounded-lg p-3 border border-border-medium">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Calendar" size={14} className="text-secondary" strokeWidth={2} />
            <span className="text-xs text-text-secondary font-mono">Next Milestone</span>
          </div>
          <span className="text-sm font-bold text-text-primary font-mono">Aug 15</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Advanced Analytics
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Predictive insights and capacity planning
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Settings" size={16} strokeWidth={2} />
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Download" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-background rounded-lg p-1">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-mono rounded-lg transition-smooth ${
              activeTab === tab?.id
                ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            }`}
          >
            <Icon name={tab?.icon} size={16} strokeWidth={2} />
            <span>{tab?.name}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'burndown' && renderBurndownChart()}
        {activeTab === 'capacity' && renderCapacityChart()}
        {activeTab === 'forecast' && renderForecastChart()}
      </div>
      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-border-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-text-secondary font-mono">
            <div className="flex items-center space-x-2">
              <Icon name="Brain" size={16} strokeWidth={2} />
              <span>ML-powered predictions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="RefreshCw" size={16} strokeWidth={2} />
              <span>Updated hourly</span>
            </div>
          </div>
          <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary-400 font-mono transition-smooth">
            <Icon name="ExternalLink" size={16} strokeWidth={2} />
            <span>Detailed Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const PRVolumeChart = ({ pullRequests, onPRSelect, selectedRepository, selectedAuthors, selectedStatuses }) => {
  const [chartView, setChartView] = useState('daily');
  const [selectedMetric, setSelectedMetric] = useState('volume');

  const generateChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date?.setDate(date?.getDate() - i);
      
      const dayData = {
        date: date?.toISOString()?.split('T')?.[0],
        displayDate: date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        opened: Math.floor(Math.random() * 8) + 2,
        merged: Math.floor(Math.random() * 6) + 1,
        closed: Math.floor(Math.random() * 3) + 1,
        avgCycleTime: (Math.random() * 4 + 1)?.toFixed(1),
        reviewTime: (Math.random() * 3 + 0.5)?.toFixed(1)
      };
      
      data?.push(dayData);
    }
    
    return data;
  };

  const chartData = generateChartData();

  const viewOptions = [
    { id: 'daily', label: 'Daily', icon: 'Calendar' },
    { id: 'weekly', label: 'Weekly', icon: 'CalendarDays' },
    { id: 'monthly', label: 'Monthly', icon: 'CalendarRange' }
  ];

  const metricOptions = [
    { id: 'volume', label: 'PR Volume', description: 'Number of PRs opened/merged/closed' },
    { id: 'cycle-time', label: 'Cycle Time', description: 'Average time from open to merge' },
    { id: 'review-time', label: 'Review Time', description: 'Average time in review' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface border border-border-medium rounded-lg p-3 shadow-elevated">
          <p className="text-text-primary font-mono text-sm font-medium mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm font-mono">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-text-secondary">{entry?.dataKey}:</span>
              <span className="text-text-primary font-medium">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (data) => {
    if (data && data?.activePayload) {
      const mockPR = pullRequests?.[Math.floor(Math.random() * pullRequests?.length)];
      onPRSelect(mockPR);
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Pull Request Analytics
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            {metricOptions?.find(m => m?.id === selectedMetric)?.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {metricOptions?.map(option => (
              <option key={option?.id} value={option?.id}>
                {option?.label}
              </option>
            ))}
          </select>
          
          {/* View Selector */}
          <div className="flex bg-background border border-border-medium rounded-lg p-1">
            {viewOptions?.map(option => (
              <button
                key={option?.id}
                onClick={() => setChartView(option?.id)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-mono transition-smooth ${
                  chartView === option?.id
                    ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name={option?.icon} size={14} strokeWidth={2} />
                <span>{option?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="flex-1 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey="displayDate" 
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
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '12px',
                color: '#94A3B8'
              }}
            />
            
            {selectedMetric === 'volume' && (
              <>
                <Bar dataKey="opened" fill="#F59E0B" name="Opened" />
                <Bar dataKey="merged" fill="#10B981" name="Merged" />
                <Bar dataKey="closed" fill="#EF4444" name="Closed" />
              </>
            )}
            
            {selectedMetric === 'cycle-time' && (
              <Line 
                type="monotone" 
                dataKey="avgCycleTime" 
                stroke="#14B8A6" 
                strokeWidth={3}
                name="Avg Cycle Time (hours)"
                dot={{ fill: '#14B8A6', strokeWidth: 2, r: 4 }}
              />
            )}
            
            {selectedMetric === 'review-time' && (
              <Line 
                type="monotone" 
                dataKey="reviewTime" 
                stroke="#6366F1" 
                strokeWidth={3}
                name="Avg Review Time (hours)"
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Chart Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-medium">
        <div className="flex items-center space-x-4 text-sm text-text-secondary font-mono">
          <span>Click on data points to view detailed PR information</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1 text-text-secondary hover:text-text-primary transition-smooth">
            <Icon name="Download" size={14} strokeWidth={2} />
            <span className="text-sm font-mono">Export</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-text-secondary hover:text-text-primary transition-smooth">
            <Icon name="Maximize2" size={14} strokeWidth={2} />
            <span className="text-sm font-mono">Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PRVolumeChart;
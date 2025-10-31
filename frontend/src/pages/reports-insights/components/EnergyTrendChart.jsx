import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

const EnergyTrendChart = ({ data, reportPeriod }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Energy Use Trend</h3>
        <p className="text-text-secondary">No data available</p>
      </div>
    );
  }

  const chartData = [...data]
    .reverse()
    .map((item, index) => ({
      index,
      time: reportPeriod === 'daily' 
        ? `${item.hour_of_day}:00`
        : `Day ${Math.floor(index / 24) + 1}`,
      energyUse: parseFloat(item.energy_use) || 0,
      prevEnergyUse: parseFloat(item.prev_energy_use) || 0,
      movingAvg: parseFloat(item.energy_ma_3) || 0,
      emissions: parseFloat(item.emissions) || 0,
    }));

  const displayData = reportPeriod === 'weekly' 
    ? chartData.filter((_, index) => index % 4 === 0)
    : chartData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} {entry.name.includes('Emissions') ? 'kg/ton' : 'kWh/ton'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Energy Use Trend
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-text-secondary">Current Energy Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary-400 rounded-full"></div>
            <span className="text-text-secondary">Previous Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-text-secondary">Moving Average</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={{ value: 'kWh/ton', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="energyUse"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#colorEnergy)"
            name="Current Energy Use"
          />
          <Line
            type="monotone"
            dataKey="prevEnergyUse"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
            name="Previous Period"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="movingAvg"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            name="3-Period Moving Avg"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Additional Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Average Energy Use</p>
          <p className="text-xl font-bold text-text-primary">
            {(displayData.reduce((sum, d) => sum + d.energyUse, 0) / displayData.length).toFixed(2)}
            <span className="text-sm font-normal text-text-secondary ml-1">kWh/ton</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Peak Energy Use</p>
          <p className="text-xl font-bold text-text-primary">
            {Math.max(...displayData.map(d => d.energyUse)).toFixed(2)}
            <span className="text-sm font-normal text-text-secondary ml-1">kWh/ton</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-text-secondary mb-1">Lowest Energy Use</p>
          <p className="text-xl font-bold text-text-primary">
            {Math.min(...displayData.map(d => d.energyUse)).toFixed(2)}
            <span className="text-sm font-normal text-text-secondary ml-1">kWh/ton</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnergyTrendChart;

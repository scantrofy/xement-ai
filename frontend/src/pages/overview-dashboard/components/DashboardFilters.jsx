import React, { useState } from 'react';
import { Factory, Layers, Clock, Users, Calendar, CalendarDays, RefreshCw } from 'lucide-react';

const DashboardFilters = ({ onFilterChange, onRefresh, isRefreshing }) => {
  const [selectedPlant, setSelectedPlant] = useState('plant1');
  const [selectedLine, setSelectedLine] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('lastHour');

  const plants = [
    { value: 'plant1', label: 'Production Plant 1' },
    { value: 'plant2', label: 'Production Plant 2' },
    { value: 'plant3', label: 'Production Plant 3' },
  ];

  const lines = [
    { value: 'all', label: 'All Lines' },
    { value: 'line1', label: 'Line 1' },
    { value: 'line2', label: 'Line 2' },
    { value: 'line3', label: 'Line 3' },
  ];

  const periods = [
    { value: 'lastHour', label: 'Last Hour', icon: Clock },
    { value: 'currentShift', label: 'Current Shift', icon: Users },
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'thisWeek', label: 'This Week', icon: CalendarDays },
  ];

  const handlePlantChange = (e) => {
    const value = e.target.value;
    setSelectedPlant(value);
    onFilterChange?.({ plant: value, line: selectedLine, period: selectedPeriod });
  };

  const handleLineChange = (e) => {
    const value = e.target.value;
    setSelectedLine(value);
    onFilterChange?.({ plant: selectedPlant, line: value, period: selectedPeriod });
  };

  const handlePeriodChange = (value) => {
    setSelectedPeriod(value);
    onFilterChange?.({ plant: selectedPlant, line: selectedLine, period: value });
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      {/* Plant and Line Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Plant Filter */}
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Plant:</label>
          <select
            value={selectedPlant}
            onChange={handlePlantChange}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[180px]"
          >
            {plants.map((plant) => (
              <option key={plant.value} value={plant.value}>
                {plant.label}
              </option>
            ))}
          </select>
        </div>

        {/* Line Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Line:</label>
          <select
            value={selectedLine}
            onChange={handleLineChange}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
          >
            {lines.map((line) => (
              <option key={line.value} value={line.value}>
                {line.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Period Filter and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Period Buttons */}
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Period:</label>
          <div className="flex gap-2">
            {periods.map((period) => {
              const Icon = period.icon;
              return (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-primary text-white'
                      : 'bg-background text-text-secondary hover:bg-surface border border-border'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {period.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-background text-text-secondary hover:bg-surface border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;

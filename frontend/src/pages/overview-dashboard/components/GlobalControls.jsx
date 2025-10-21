import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GlobalControls = () => {
  const [selectedPlant, setSelectedPlant] = useState('plant-1');
  const [selectedLine, setSelectedLine] = useState('all');
  const [timeRange, setTimeRange] = useState('hour');

  const plants = [
    { id: 'plant-1', name: 'Production Plant 1', location: 'North Facility' },
    { id: 'plant-2', name: 'Production Plant 2', location: 'South Facility' },
  ];

  const productionLines = [
    { id: 'all', name: 'All Lines' },
    { id: 'line-1', name: 'Line 1 - Cement' },
    { id: 'line-2', name: 'Line 2 - Cement' },
    { id: 'line-3', name: 'Line 3 - Aggregates' },
  ];

  const timeRanges = [
    { id: 'hour', name: 'Last Hour', icon: 'Clock' },
    { id: 'shift', name: 'Current Shift', icon: 'Users' },
    { id: 'day', name: 'Today', icon: 'Calendar' },
    { id: 'week', name: 'This Week', icon: 'CalendarDays' },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Plant Selector */}
        <div className="flex items-center space-x-2">
          <Icon name="Building" size={18} className="text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Plant:</label>
          <select 
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e?.target?.value)}
            className="border border-border-medium rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:border-primary"
          >
            {plants?.map((plant) => (
              <option key={plant?.id} value={plant?.id}>
                {plant?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Production Line Filter */}
        <div className="flex items-center space-x-2">
          <Icon name="Workflow" size={18} className="text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Line:</label>
          <select 
            value={selectedLine}
            onChange={(e) => setSelectedLine(e?.target?.value)}
            className="border border-border-medium rounded px-3 py-1.5 text-sm bg-background focus:outline-none focus:border-primary"
          >
            {productionLines?.map((line) => (
              <option key={line?.id} value={line?.id}>
                {line?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Range Picker */}
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={18} className="text-text-secondary" />
          <label className="text-sm font-medium text-text-secondary">Period:</label>
          <div className="flex bg-background border border-border-medium rounded overflow-hidden">
            {timeRanges?.map((range) => (
              <button
                key={range?.id}
                onClick={() => setTimeRange(range?.id)}
                className={`px-3 py-1.5 text-sm flex items-center space-x-1.5 transition-colors ${
                  timeRange === range?.id 
                    ? 'bg-primary text-white' :'text-text-secondary hover:bg-surface-light'
                }`}
              >
                <Icon name={range?.icon} size={14} strokeWidth={2} />
                <span>{range?.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center ml-auto">
          <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-text-secondary hover:text-primary border border-border-medium rounded hover:border-primary transition-colors">
            <Icon name="RefreshCw" size={14} strokeWidth={2} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;
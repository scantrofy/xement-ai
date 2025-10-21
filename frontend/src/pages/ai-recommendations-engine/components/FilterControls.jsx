import React from 'react';
import Icon from '../../../components/AppIcon';

const FilterControls = ({
  selectedCategory,
  selectedPriority,
  implementationStatus,
  onCategoryChange,
  onPriorityChange,
  onStatusChange,
}) => {
  const categories = [
    { id: 'all', name: 'All Categories', icon: 'Grid3X3' },
    { id: 'energy', name: 'Energy', icon: 'Zap' },
    { id: 'efficiency', name: 'Efficiency', icon: 'Settings' },
    { id: 'emissions', name: 'Emissions', icon: 'Cloud' },
    { id: 'maintenance', name: 'Maintenance', icon: 'Wrench' },
    { id: 'quality', name: 'Quality', icon: 'Award' },
  ];

  const priorities = [
    { id: 'all', name: 'All Priorities', color: 'text-text-secondary' },
    { id: 'high', name: 'High Priority', color: 'text-red-600' },
    { id: 'medium', name: 'Medium Priority', color: 'text-yellow-600' },
    { id: 'low', name: 'Low Priority', color: 'text-green-600' },
  ];

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'pending', name: 'Pending' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'completed', name: 'Completed' },
    { id: 'paused', name: 'Paused' },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Category Filter */}
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={18} className="text-text-secondary" strokeWidth={2} />
          <label className="text-sm font-medium text-text-secondary">Category:</label>
          <div className="flex bg-background border border-border-medium rounded overflow-hidden">
            {categories?.map((category) => (
              <button
                key={category?.id}
                onClick={() => onCategoryChange(category?.id)}
                className={`px-3 py-2 text-sm flex items-center space-x-1.5 transition-colors ${
                  selectedCategory === category?.id 
                    ? 'bg-primary text-white' :'text-text-secondary hover:bg-surface-light'
                }`}
              >
                <Icon name={category?.icon} size={14} strokeWidth={2} />
                <span>{category?.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selector */}
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={18} className="text-text-secondary" strokeWidth={2} />
          <label className="text-sm font-medium text-text-secondary">Priority:</label>
          <select 
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e?.target?.value)}
            className="border border-border-medium rounded px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary"
          >
            {priorities?.map((priority) => (
              <option key={priority?.id} value={priority?.id}>
                {priority?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Implementation Status */}
        <div className="flex items-center space-x-3">
          <Icon name="CheckCircle" size={18} className="text-text-secondary" strokeWidth={2} />
          <label className="text-sm font-medium text-text-secondary">Status:</label>
          <select 
            value={implementationStatus}
            onChange={(e) => onStatusChange(e?.target?.value)}
            className="border border-border-medium rounded px-3 py-2 text-sm bg-background focus:outline-none focus:border-primary"
          >
            {statuses?.map((status) => (
              <option key={status?.id} value={status?.id}>
                {status?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 ml-auto">
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary border border-border-medium rounded hover:border-primary transition-colors">
            <Icon name="RotateCcw" size={14} strokeWidth={2} />
            <span>Reset Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary border border-border-medium rounded hover:border-primary transition-colors">
            <Icon name="Download" size={14} strokeWidth={2} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
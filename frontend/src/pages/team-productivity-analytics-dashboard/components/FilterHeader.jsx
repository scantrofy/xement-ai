import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const FilterHeader = ({ filters, onFilterChange }) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const teams = [
    { id: 'all', name: 'All Teams', count: 24 },
    { id: 'frontend', name: 'Frontend Team', count: 8 },
    { id: 'backend', name: 'Backend Team', count: 7 },
    { id: 'mobile', name: 'Mobile Team', count: 5 },
    { id: 'devops', name: 'DevOps Team', count: 4 }
  ];

  const sprints = [
    { id: 'current', name: 'Current Sprint (Sprint 24)', status: 'active' },
    { id: 'sprint-23', name: 'Sprint 23', status: 'completed' },
    { id: 'sprint-22', name: 'Sprint 22', status: 'completed' },
    { id: 'sprint-21', name: 'Sprint 21', status: 'completed' }
  ];

  const dateRanges = [
    { id: 'last-7-days', name: 'Last 7 days' },
    { id: 'last-30-days', name: 'Last 30 days' },
    { id: 'last-90-days', name: 'Last 90 days' },
    { id: 'current-quarter', name: 'Current Quarter' },
    { id: 'last-quarter', name: 'Last Quarter' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const handleFilterUpdate = (key, value) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 mb-8">
      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Team Selector */}
        <div>
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Team
          </label>
          <div className="relative">
            <select
              value={filters?.team}
              onChange={(e) => handleFilterUpdate('team', e?.target?.value)}
              className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {teams?.map(team => (
                <option key={team?.id} value={team?.id}>
                  {team?.name} ({team?.count})
                </option>
              ))}
            </select>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" 
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Sprint/Milestone Picker */}
        <div>
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Sprint/Milestone
          </label>
          <div className="relative">
            <select
              value={filters?.sprint}
              onChange={(e) => handleFilterUpdate('sprint', e?.target?.value)}
              className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {sprints?.map(sprint => (
                <option key={sprint?.id} value={sprint?.id}>
                  {sprint?.name}
                </option>
              ))}
            </select>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" 
              strokeWidth={2}
            />
          </div>
        </div>

        {/* Comparison Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Comparison Mode
          </label>
          <div className="flex bg-background border border-border-medium rounded-lg p-1">
            <button
              onClick={() => handleFilterUpdate('comparisonMode', 'team')}
              className={`flex-1 px-3 py-1 text-sm font-mono rounded transition-smooth ${
                filters?.comparisonMode === 'team' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => handleFilterUpdate('comparisonMode', 'individual')}
              className={`flex-1 px-3 py-1 text-sm font-mono rounded transition-smooth ${
                filters?.comparisonMode === 'individual' ?'bg-primary text-white' :'text-text-secondary hover:text-text-primary'
              }`}
            >
              Individual
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Date Range
          </label>
          <div className="relative">
            <select
              value={filters?.dateRange}
              onChange={(e) => handleFilterUpdate('dateRange', e?.target?.value)}
              className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              {dateRanges?.map(range => (
                <option key={range?.id} value={range?.id}>
                  {range?.name}
                </option>
              ))}
            </select>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none" 
              strokeWidth={2}
            />
          </div>
        </div>
      </div>
      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-border-medium">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary font-mono transition-smooth"
        >
          <Icon 
            name={isAdvancedOpen ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            strokeWidth={2}
          />
          <span>Advanced Filters</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-sm text-text-secondary font-mono">
              Fiscal Period: Q1 2024
            </span>
          </div>
          <button
            onClick={() => onFilterChange({
              team: 'all',
              sprint: 'current',
              comparisonMode: 'team',
              dateRange: 'last-30-days'
            })}
            className="text-sm text-primary hover:text-primary-400 font-mono transition-smooth"
          >
            Reset Filters
          </button>
        </div>
      </div>
      {/* Advanced Filters Panel */}
      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t border-border-medium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Repository Filter
              </label>
              <input
                type="text"
                placeholder="Filter by repository..."
                className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Minimum Commits
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Include Weekends
              </label>
              <div className="flex items-center space-x-3 mt-3">
                <input
                  type="checkbox"
                  id="includeWeekends"
                  className="w-4 h-4 text-primary bg-background border border-border-medium rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="includeWeekends" className="text-sm text-text-secondary font-mono">
                  Include weekend activity
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterHeader;
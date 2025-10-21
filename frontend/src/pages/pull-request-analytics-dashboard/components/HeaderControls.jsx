import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const HeaderControls = ({
  repositories,
  authors,
  selectedRepository,
  setSelectedRepository,
  selectedAuthors,
  setSelectedAuthors,
  selectedStatuses,
  setSelectedStatuses,
  dateRange,
  setDateRange
}) => {
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const statusOptions = [
    { id: 'open', label: 'Open', color: 'text-warning' },
    { id: 'merged', label: 'Merged', color: 'text-success' },
    { id: 'closed', label: 'Closed', color: 'text-error' }
  ];

  const dateRangeOptions = [
    { id: 'last-7-days', label: 'Last 7 days' },
    { id: 'last-30-days', label: 'Last 30 days' },
    { id: 'last-90-days', label: 'Last 90 days' },
    { id: 'last-6-months', label: 'Last 6 months' },
    { id: 'custom', label: 'Custom range' }
  ];

  const handleAuthorToggle = (authorId) => {
    setSelectedAuthors(prev => 
      prev?.includes(authorId) 
        ? prev?.filter(id => id !== authorId)
        : [...prev, authorId]
    );
  };

  const handleStatusToggle = (statusId) => {
    setSelectedStatuses(prev => 
      prev?.includes(statusId) 
        ? prev?.filter(id => id !== statusId)
        : [...prev, statusId]
    );
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Repository Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary font-mono">
            Repository
          </label>
          <select
            value={selectedRepository}
            onChange={(e) => setSelectedRepository(e?.target?.value)}
            className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {repositories?.map(repo => (
              <option key={repo?.id} value={repo?.id}>
                {repo?.name}
              </option>
            ))}
          </select>
        </div>

        {/* Author Multi-Select */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-text-secondary font-mono">
            Authors
          </label>
          <button
            onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
            className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-left text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between"
          >
            <span>
              {selectedAuthors?.length === 0 
                ? 'All Authors' 
                : `${selectedAuthors?.length} selected`
              }
            </span>
            <Icon name="ChevronDown" size={16} strokeWidth={2} />
          </button>
          
          {isAuthorDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-medium rounded-lg shadow-elevated z-50 max-h-48 overflow-y-auto">
              {authors?.map(author => (
                <label
                  key={author?.id}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-surface-light cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAuthors?.includes(author?.id)}
                    onChange={() => handleAuthorToggle(author?.id)}
                    className="w-4 h-4 text-primary bg-background border-border-medium rounded focus:ring-primary focus:ring-2"
                  />
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-text-primary font-mono">
                    {author?.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status Toggles */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-text-secondary font-mono">
            PR Status
          </label>
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-left text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center justify-between"
          >
            <span>
              {selectedStatuses?.length === 0 
                ? 'No Status' 
                : `${selectedStatuses?.length} selected`
              }
            </span>
            <Icon name="ChevronDown" size={16} strokeWidth={2} />
          </button>
          
          {isStatusDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-medium rounded-lg shadow-elevated z-50">
              {statusOptions?.map(status => (
                <label
                  key={status?.id}
                  className="flex items-center space-x-3 px-3 py-2 hover:bg-surface-light cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses?.includes(status?.id)}
                    onChange={() => handleStatusToggle(status?.id)}
                    className="w-4 h-4 text-primary bg-background border-border-medium rounded focus:ring-primary focus:ring-2"
                  />
                  <span className={`text-sm font-mono ${status?.color}`}>
                    {status?.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary font-mono">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e?.target?.value)}
            className="w-full bg-background border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {dateRangeOptions?.map(option => (
              <option key={option?.id} value={option?.id}>
                {option?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-border-medium">
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-mono border border-primary/20 hover:bg-primary/20 transition-smooth">
            Large PRs
          </button>
          <button className="px-3 py-1 bg-surface-light text-text-secondary rounded-full text-xs font-mono border border-border-medium hover:bg-surface-lighter transition-smooth">
            Needs Review
          </button>
          <button className="px-3 py-1 bg-surface-light text-text-secondary rounded-full text-xs font-mono border border-border-medium hover:bg-surface-lighter transition-smooth">
            Stale PRs
          </button>
          <button className="px-3 py-1 bg-surface-light text-text-secondary rounded-full text-xs font-mono border border-border-medium hover:bg-surface-lighter transition-smooth">
            High Priority
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderControls;
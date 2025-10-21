import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const GlobalControls = ({ onFiltersChange }) => {
  const [selectedRepositories, setSelectedRepositories] = useState(['all']);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState(['all']);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [showRepoDropdown, setShowRepoDropdown] = useState(false);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  const repositories = [
    { id: 'all', name: 'All Repositories', count: 12 },
    { id: 'frontend-app', name: 'frontend-app', count: 8 },
    { id: 'backend-api', name: 'backend-api', count: 15 },
    { id: 'mobile-app', name: 'mobile-app', count: 6 },
    { id: 'data-pipeline', name: 'data-pipeline', count: 4 },
    { id: 'infrastructure', name: 'infrastructure', count: 3 }
  ];

  const teamMembers = [
    { id: 'all', name: 'All Team Members', avatar: null },
    { id: 'sarah-chen', name: 'Sarah Chen', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', role: 'Senior Frontend' },
    { id: 'mike-rodriguez', name: 'Mike Rodriguez', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', role: 'Backend Lead' },
    { id: 'emily-johnson', name: 'Emily Johnson', avatar: 'https://randomuser.me/api/portraits/women/3.jpg', role: 'Full Stack' },
    { id: 'david-kim', name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', role: 'DevOps Engineer' },
    { id: 'lisa-wang', name: 'Lisa Wang', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', role: 'QA Engineer' }
  ];

  const timeRanges = [
    { id: 'today', label: 'Today', description: 'Last 24 hours' },
    { id: 'week', label: 'Week', description: 'Last 7 days' },
    { id: 'month', label: 'Month', description: 'Last 30 days' },
    { id: 'quarter', label: 'Quarter', description: 'Last 90 days' }
  ];

  const handleRepositoryChange = (repoId) => {
    let newSelection;
    if (repoId === 'all') {
      newSelection = ['all'];
    } else {
      newSelection = selectedRepositories?.includes('all') 
        ? [repoId]
        : selectedRepositories?.includes(repoId)
          ? selectedRepositories?.filter(id => id !== repoId)
          : [...selectedRepositories, repoId];
      
      if (newSelection?.length === 0) {
        newSelection = ['all'];
      }
    }
    setSelectedRepositories(newSelection);
    onFiltersChange?.({ repositories: newSelection, teamMembers: selectedTeamMembers, timeRange: selectedTimeRange });
  };

  const handleTeamMemberChange = (memberId) => {
    let newSelection;
    if (memberId === 'all') {
      newSelection = ['all'];
    } else {
      newSelection = selectedTeamMembers?.includes('all') 
        ? [memberId]
        : selectedTeamMembers?.includes(memberId)
          ? selectedTeamMembers?.filter(id => id !== memberId)
          : [...selectedTeamMembers, memberId];
      
      if (newSelection?.length === 0) {
        newSelection = ['all'];
      }
    }
    setSelectedTeamMembers(newSelection);
    onFiltersChange?.({ repositories: selectedRepositories, teamMembers: newSelection, timeRange: selectedTimeRange });
  };

  const handleTimeRangeChange = (rangeId) => {
    setSelectedTimeRange(rangeId);
    onFiltersChange?.({ repositories: selectedRepositories, teamMembers: selectedTeamMembers, timeRange: rangeId });
  };

  const getSelectedRepoText = () => {
    if (selectedRepositories?.includes('all')) return 'All Repositories';
    if (selectedRepositories?.length === 1) {
      const repo = repositories?.find(r => r?.id === selectedRepositories?.[0]);
      return repo?.name || 'Select Repository';
    }
    return `${selectedRepositories?.length} Repositories`;
  };

  const getSelectedTeamText = () => {
    if (selectedTeamMembers?.includes('all')) return 'All Team Members';
    if (selectedTeamMembers?.length === 1) {
      const member = teamMembers?.find(m => m?.id === selectedTeamMembers?.[0]);
      return member?.name || 'Select Member';
    }
    return `${selectedTeamMembers?.length} Members`;
  };

  return (
    <div className="bg-surface border border-border-medium rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Repository Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Repository Filter
          </label>
          <button
            onClick={() => setShowRepoDropdown(!showRepoDropdown)}
            className="w-full bg-background border border-border-medium rounded-lg px-4 py-3 text-left text-text-primary font-mono text-sm hover:border-primary/50 transition-smooth flex items-center justify-between"
          >
            <span className="truncate">{getSelectedRepoText()}</span>
            <Icon name={showRepoDropdown ? "ChevronUp" : "ChevronDown"} size={16} strokeWidth={2} />
          </button>
          
          {showRepoDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-medium rounded-lg shadow-elevated z-50 max-h-64 overflow-y-auto">
              {repositories?.map((repo) => (
                <button
                  key={repo?.id}
                  onClick={() => handleRepositoryChange(repo?.id)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-light transition-smooth flex items-center justify-between border-b border-border-light last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedRepositories?.includes(repo?.id) 
                        ? 'bg-primary border-primary' :'border-border-medium'
                    }`}>
                      {selectedRepositories?.includes(repo?.id) && (
                        <Icon name="Check" size={12} color="#F8FAFC" strokeWidth={2} />
                      )}
                    </div>
                    <span className="text-text-primary font-mono text-sm">{repo?.name}</span>
                  </div>
                  {repo?.id !== 'all' && (
                    <span className="text-xs text-text-secondary font-mono bg-surface-light px-2 py-1 rounded">
                      {repo?.count} PRs
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Team Member Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Team Member Filter
          </label>
          <button
            onClick={() => setShowTeamDropdown(!showTeamDropdown)}
            className="w-full bg-background border border-border-medium rounded-lg px-4 py-3 text-left text-text-primary font-mono text-sm hover:border-primary/50 transition-smooth flex items-center justify-between"
          >
            <span className="truncate">{getSelectedTeamText()}</span>
            <Icon name={showTeamDropdown ? "ChevronUp" : "ChevronDown"} size={16} strokeWidth={2} />
          </button>
          
          {showTeamDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-medium rounded-lg shadow-elevated z-50 max-h-64 overflow-y-auto">
              {teamMembers?.map((member) => (
                <button
                  key={member?.id}
                  onClick={() => handleTeamMemberChange(member?.id)}
                  className="w-full px-4 py-3 text-left hover:bg-surface-light transition-smooth flex items-center justify-between border-b border-border-light last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedTeamMembers?.includes(member?.id) 
                        ? 'bg-primary border-primary' :'border-border-medium'
                    }`}>
                      {selectedTeamMembers?.includes(member?.id) && (
                        <Icon name="Check" size={12} color="#F8FAFC" strokeWidth={2} />
                      )}
                    </div>
                    {member?.avatar ? (
                      <img 
                        src={member?.avatar} 
                        alt={member?.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Icon name="Users" size={12} color="#F8FAFC" strokeWidth={2} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-text-primary font-mono text-sm">{member?.name}</span>
                      {member?.role && (
                        <span className="text-xs text-text-secondary font-mono">{member?.role}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Range Filter */}
        <div>
          <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
            Time Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            {timeRanges?.map((range) => (
              <button
                key={range?.id}
                onClick={() => handleTimeRangeChange(range?.id)}
                className={`px-4 py-3 rounded-lg font-mono text-sm transition-smooth border ${
                  selectedTimeRange === range?.id
                    ? 'bg-primary/10 border-primary text-primary' :'bg-background border-border-medium text-text-primary hover:border-primary/50'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium">{range?.label}</div>
                  <div className="text-xs opacity-70">{range?.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Active Filters Summary */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm font-mono">
            <span className="text-text-secondary">Active Filters:</span>
            <span className="text-text-primary">
              {getSelectedRepoText()} • {getSelectedTeamText()} • {timeRanges?.find(r => r?.id === selectedTimeRange)?.label}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedRepositories(['all']);
              setSelectedTeamMembers(['all']);
              setSelectedTimeRange('week');
              onFiltersChange?.({ repositories: ['all'], teamMembers: ['all'], timeRange: 'week' });
            }}
            className="text-sm font-mono text-text-secondary hover:text-primary transition-smooth flex items-center space-x-1"
          >
            <Icon name="RotateCcw" size={14} strokeWidth={2} />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;
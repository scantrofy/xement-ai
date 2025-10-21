import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RepositoryTable = ({ repositories }) => {
  const [sortField, setSortField] = useState('healthScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRepos, setSelectedRepos] = useState(new Set());

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectRepo = (repoId) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected?.has(repoId)) {
      newSelected?.delete(repoId);
    } else {
      newSelected?.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRepos?.size === repositories?.length) {
      setSelectedRepos(new Set());
    } else {
      setSelectedRepos(new Set(repositories.map(repo => repo.id)));
    }
  };

  const sortedRepositories = [...repositories]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue?.toLowerCase();
      bValue = bValue?.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'critical':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getSyncStatusIcon = (syncStatus) => {
    switch (syncStatus) {
      case 'synced':
        return 'CheckCircle2';
      case 'syncing':
        return 'RotateCw';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Circle';
    }
  };

  const getSyncStatusColor = (syncStatus) => {
    switch (syncStatus) {
      case 'synced':
        return 'text-success';
      case 'syncing':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <Icon name="ArrowUpDown" size={14} className="text-text-secondary" strokeWidth={2} />;
    }
    return (
      <Icon 
        name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
        size={14} 
        className="text-primary" 
        strokeWidth={2} 
      />
    );
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 border-b border-border-medium">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Table" size={18} className="text-primary" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary font-mono">
            Repository Comparison
          </h2>
          {selectedRepos?.size > 0 && (
            <span className="text-sm text-primary font-mono">
              {selectedRepos?.size} selected
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedRepos?.size > 0 && (
            <>
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth font-mono text-sm">
                <Icon name="RefreshCw" size={14} strokeWidth={2} />
                <span>Sync Selected</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1.5 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-smooth font-mono text-sm">
                <Icon name="Settings" size={14} strokeWidth={2} />
                <span>Configure</span>
              </button>
            </>
          )}
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-lighter transition-smooth font-mono text-sm">
            <Icon name="Download" size={14} strokeWidth={2} />
            <span>Export</span>
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-light">
            <tr>
              <th className="text-left p-4">
                <input
                  type="checkbox"
                  checked={selectedRepos?.size === repositories?.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary bg-surface border border-border-medium rounded focus:ring-primary focus:ring-2"
                />
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Repository</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('healthScore')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Health Score</span>
                  <SortIcon field="healthScore" />
                </div>
              </th>
              <th className="text-left p-4">
                <span className="text-sm font-medium text-text-primary font-mono">Sync Status</span>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('openIssues')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Issues</span>
                  <SortIcon field="openIssues" />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('stalePRs')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Stale PRs</span>
                  <SortIcon field="stalePRs" />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-surface transition-smooth"
                onClick={() => handleSort('coverage')}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary font-mono">Coverage</span>
                  <SortIcon field="coverage" />
                </div>
              </th>
              <th className="text-left p-4">
                <span className="text-sm font-medium text-text-primary font-mono">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRepositories?.map((repo, index) => (
              <tr 
                key={repo?.id} 
                className={`border-t border-border-medium hover:bg-surface-light/50 transition-smooth ${
                  selectedRepos?.has(repo?.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedRepos?.has(repo?.id)}
                    onChange={() => handleSelectRepo(repo?.id)}
                    className="w-4 h-4 text-primary bg-surface border border-border-medium rounded focus:ring-primary focus:ring-2"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="GitBranch" size={16} className="text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-medium text-text-primary font-mono">{repo?.name}</div>
                      <div className="text-xs text-text-secondary font-mono">{repo?.lastCommit}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`flex items-center space-x-2 ${getStatusColor(repo?.status)}`}>
                    <Icon name={getStatusIcon(repo?.status)} size={16} strokeWidth={2} />
                    <span className="text-sm font-mono capitalize">{repo?.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 bg-surface-light rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          repo?.healthScore >= 85 ? 'bg-success' :
                          repo?.healthScore >= 70 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${repo?.healthScore}%` }}
                      />
                    </div>
                    <span className={`text-sm font-mono font-medium ${
                      repo?.healthScore >= 85 ? 'text-success' :
                      repo?.healthScore >= 70 ? 'text-warning' : 'text-error'
                    }`}>
                      {repo?.healthScore}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`flex items-center space-x-2 ${getSyncStatusColor(repo?.syncStatus)}`}>
                    <Icon name={getSyncStatusIcon(repo?.syncStatus)} size={16} strokeWidth={2} />
                    <span className="text-sm font-mono capitalize">{repo?.syncStatus}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm font-mono text-text-primary">{repo?.openIssues}</span>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-mono ${repo?.stalePRs > 3 ? 'text-error' : 'text-text-primary'}`}>
                    {repo?.stalePRs}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-mono ${
                    repo?.coverage >= 80 ? 'text-success' :
                    repo?.coverage >= 60 ? 'text-warning' : 'text-error'
                  }`}>
                    {repo?.coverage}%
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-smooth">
                      <Icon name="RefreshCw" size={14} strokeWidth={2} />
                    </button>
                    <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-smooth">
                      <Icon name="Settings" size={14} strokeWidth={2} />
                    </button>
                    <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-primary/10 rounded transition-smooth">
                      <Icon name="ExternalLink" size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Table Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border-medium bg-surface-light">
        <div className="text-sm text-text-secondary font-mono">
          Showing {repositories?.length} repositories
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-text-secondary hover:text-primary hover:bg-surface rounded transition-smooth">
            <Icon name="ChevronLeft" size={16} strokeWidth={2} />
          </button>
          <span className="px-3 py-1 bg-primary text-white rounded font-mono text-sm">1</span>
          <button className="p-2 text-text-secondary hover:text-primary hover:bg-surface rounded transition-smooth">
            <Icon name="ChevronRight" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepositoryTable;
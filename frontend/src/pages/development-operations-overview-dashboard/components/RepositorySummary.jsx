import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RepositorySummary = () => {
  const [sortBy, setSortBy] = useState('health');
  const [sortOrder, setSortOrder] = useState('desc');

  const repositoryData = [
    {
      id: 'frontend-app',
      name: 'frontend-app',
      description: 'React-based user interface application with modern design system',
      openPRs: 8,
      openIssues: 12,
      lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
      healthScore: 92,
      language: 'TypeScript',
      stars: 156,
      forks: 23,
      contributors: 8,
      coverage: 87,
      vulnerabilities: 0,
      status: 'healthy',
      deploymentStatus: 'deployed',
      lastCommit: {
        author: 'Sarah Chen',
        message: 'Fix responsive layout issues',
        hash: 'a1b2c3d'
      },
      metrics: {
        commits: 45,
        prsThisWeek: 3,
        avgCycleTime: '2.1d'
      }
    },
    {
      id: 'backend-api',
      name: 'backend-api',
      description: 'Node.js REST API with GraphQL support and microservices architecture',
      openPRs: 15,
      openIssues: 8,
      lastActivity: new Date(Date.now() - 600000), // 10 minutes ago
      healthScore: 88,
      language: 'JavaScript',
      stars: 203,
      forks: 45,
      contributors: 12,
      coverage: 91,
      vulnerabilities: 2,
      status: 'warning',
      deploymentStatus: 'pending',
      lastCommit: {
        author: 'Mike Rodriguez',
        message: 'Optimize database connection pooling',
        hash: 'x7y8z9a'
      },
      metrics: {
        commits: 67,
        prsThisWeek: 5,
        avgCycleTime: '2.8d'
      }
    },
    {
      id: 'mobile-app',
      name: 'mobile-app',
      description: 'React Native cross-platform mobile application',
      openPRs: 6,
      openIssues: 15,
      lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
      healthScore: 75,
      language: 'TypeScript',
      stars: 89,
      forks: 12,
      contributors: 5,
      coverage: 72,
      vulnerabilities: 1,
      status: 'warning',
      deploymentStatus: 'failed',
      lastCommit: {
        author: 'Emily Johnson',
        message: 'Update navigation library',
        hash: 'p4q5r6s'
      },
      metrics: {
        commits: 28,
        prsThisWeek: 2,
        avgCycleTime: '3.2d'
      }
    },
    {
      id: 'data-pipeline',
      name: 'data-pipeline',
      description: 'Python-based ETL pipeline for data processing and analytics',
      openPRs: 4,
      openIssues: 6,
      lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
      healthScore: 95,
      language: 'Python',
      stars: 67,
      forks: 8,
      contributors: 4,
      coverage: 94,
      vulnerabilities: 0,
      status: 'healthy',
      deploymentStatus: 'deployed',
      lastCommit: {
        author: 'David Kim',
        message: 'Add data validation checks',
        hash: 'm8n9o0p'
      },
      metrics: {
        commits: 23,
        prsThisWeek: 1,
        avgCycleTime: '1.5d'
      }
    },
    {
      id: 'infrastructure',
      name: 'infrastructure',
      description: 'Terraform and Kubernetes configurations for cloud infrastructure',
      openPRs: 3,
      openIssues: 4,
      lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
      healthScore: 90,
      language: 'HCL',
      stars: 34,
      forks: 6,
      contributors: 3,
      coverage: 85,
      vulnerabilities: 0,
      status: 'healthy',
      deploymentStatus: 'deployed',
      lastCommit: {
        author: 'Lisa Wang',
        message: 'Update cluster autoscaling config',
        hash: 't1u2v3w'
      },
      metrics: {
        commits: 15,
        prsThisWeek: 1,
        avgCycleTime: '1.8d'
      }
    },
    {
      id: 'documentation',
      name: 'documentation',
      description: 'Technical documentation and API reference guides',
      openPRs: 2,
      openIssues: 9,
      lastActivity: new Date(Date.now() - 10800000), // 3 hours ago
      healthScore: 82,
      language: 'Markdown',
      stars: 45,
      forks: 15,
      contributors: 7,
      coverage: 0,
      vulnerabilities: 0,
      status: 'healthy',
      deploymentStatus: 'deployed',
      lastCommit: {
        author: 'Sarah Chen',
        message: 'Update API documentation',
        hash: 'h4i5j6k'
      },
      metrics: {
        commits: 18,
        prsThisWeek: 1,
        avgCycleTime: '1.2d'
      }
    }
  ];

  const sortedData = [...repositoryData]?.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a?.name?.toLowerCase();
        bValue = b?.name?.toLowerCase();
        break;
      case 'health':
        aValue = a?.healthScore;
        bValue = b?.healthScore;
        break;
      case 'activity':
        aValue = a?.lastActivity?.getTime();
        bValue = b?.lastActivity?.getTime();
        break;
      case 'prs':
        aValue = a?.openPRs;
        bValue = b?.openPRs;
        break;
      default:
        aValue = a?.healthScore;
        bValue = b?.healthScore;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status) => {
    const colorMap = {
      healthy: 'success',
      warning: 'warning',
      error: 'error'
    };
    return colorMap?.[status] || 'primary';
  };

  const getDeploymentStatusColor = (status) => {
    const colorMap = {
      deployed: 'success',
      pending: 'warning',
      failed: 'error'
    };
    return colorMap?.[status] || 'primary';
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getLanguageColor = (language) => {
    const colorMap = {
      TypeScript: 'bg-blue-500',
      JavaScript: 'bg-yellow-500',
      Python: 'bg-green-500',
      HCL: 'bg-purple-500',
      Markdown: 'bg-gray-500'
    };
    return colorMap?.[language] || 'bg-primary';
  };

  return (
    <div className="bg-surface border border-border-medium rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-mono">
            Repository Summary
          </h2>
          <p className="text-sm text-text-secondary font-mono mt-1">
            Overview of all repositories with health metrics and activity status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-mono text-sm hover:bg-primary-600 transition-smooth flex items-center space-x-2">
            <Icon name="Plus" size={16} strokeWidth={2} />
            <span>Add Repository</span>
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Download" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-medium">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 text-text-secondary hover:text-text-primary font-mono text-sm font-medium transition-smooth"
                >
                  <span>Repository</span>
                  <Icon name={sortBy === 'name' ? (sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={14} strokeWidth={2} />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('health')}
                  className="flex items-center space-x-1 text-text-secondary hover:text-text-primary font-mono text-sm font-medium transition-smooth"
                >
                  <span>Health</span>
                  <Icon name={sortBy === 'health' ? (sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={14} strokeWidth={2} />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('prs')}
                  className="flex items-center space-x-1 text-text-secondary hover:text-text-primary font-mono text-sm font-medium transition-smooth"
                >
                  <span>Open PRs</span>
                  <Icon name={sortBy === 'prs' ? (sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={14} strokeWidth={2} />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => handleSort('activity')}
                  className="flex items-center space-x-1 text-text-secondary hover:text-text-primary font-mono text-sm font-medium transition-smooth"
                >
                  <span>Last Activity</span>
                  <Icon name={sortBy === 'activity' ? (sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} size={14} strokeWidth={2} />
                </button>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-text-secondary font-mono text-sm font-medium">Deployment</span>
              </th>
              <th className="text-left py-3 px-4">
                <span className="text-text-secondary font-mono text-sm font-medium">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((repo) => (
              <tr key={repo?.id} className="border-b border-border-light hover:bg-background transition-smooth">
                <td className="py-4 px-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo?.language)}`} />
                      <Icon name="GitBranch" size={16} className="text-text-secondary" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-text-primary font-mono">
                          {repo?.name}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-mono bg-${getStatusColor(repo?.status)}/10 text-${getStatusColor(repo?.status)}`}>
                          {repo?.status}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary font-mono mt-1 truncate">
                        {repo?.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-text-secondary font-mono">
                        <span className="flex items-center space-x-1">
                          <Icon name="Star" size={12} strokeWidth={2} />
                          <span>{repo?.stars}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="GitFork" size={12} strokeWidth={2} />
                          <span>{repo?.forks}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Icon name="Users" size={12} strokeWidth={2} />
                          <span>{repo?.contributors}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-text-primary font-mono">
                          {repo?.healthScore}%
                        </span>
                        <span className="text-xs text-text-secondary font-mono">
                          {repo?.coverage}% coverage
                        </span>
                      </div>
                      <div className="w-full bg-surface-light rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-${getStatusColor(repo?.status)}`}
                          style={{ width: `${repo?.healthScore}%` }}
                        />
                      </div>
                      {repo?.vulnerabilities > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Icon name="AlertTriangle" size={12} className="text-error" strokeWidth={2} />
                          <span className="text-xs text-error font-mono">
                            {repo?.vulnerabilities} vulnerabilities
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary font-mono">
                      {repo?.openPRs}
                    </span>
                    <span className="text-xs text-text-secondary font-mono">
                      / {repo?.openIssues} issues
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary font-mono mt-1">
                    {repo?.metrics?.prsThisWeek} PRs this week
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <div className="text-sm text-text-primary font-mono">
                      {formatTimestamp(repo?.lastActivity)}
                    </div>
                    <div className="text-xs text-text-secondary font-mono mt-1">
                      {repo?.lastCommit?.author}: {repo?.lastCommit?.message?.substring(0, 30)}...
                    </div>
                    <div className="text-xs text-text-secondary font-mono mt-1">
                      {repo?.lastCommit?.hash}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-${getDeploymentStatusColor(repo?.deploymentStatus)}`} />
                    <span className={`text-sm font-mono text-${getDeploymentStatusColor(repo?.deploymentStatus)}`}>
                      {repo?.deploymentStatus}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary font-mono mt-1">
                    Avg cycle: {repo?.metrics?.avgCycleTime}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
                      <Icon name="ExternalLink" size={14} strokeWidth={2} />
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
                      <Icon name="Settings" size={14} strokeWidth={2} />
                    </button>
                    <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
                      <Icon name="MoreHorizontal" size={14} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {sortedData?.map((repo) => (
          <div key={repo?.id} className="bg-background border border-border-light rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo?.language)}`} />
                <h3 className="text-sm font-medium text-text-primary font-mono">
                  {repo?.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-mono bg-${getStatusColor(repo?.status)}/10 text-${getStatusColor(repo?.status)}`}>
                  {repo?.status}
                </span>
              </div>
              <button className="p-1 text-text-secondary hover:text-text-primary transition-smooth">
                <Icon name="MoreHorizontal" size={16} strokeWidth={2} />
              </button>
            </div>
            
            <p className="text-xs text-text-secondary font-mono mb-3">
              {repo?.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <span className="text-xs text-text-secondary font-mono">Health Score</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium text-text-primary font-mono">
                    {repo?.healthScore}%
                  </span>
                  <div className="flex-1 bg-surface-light rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full bg-${getStatusColor(repo?.status)}`}
                      style={{ width: `${repo?.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-text-secondary font-mono">Open PRs</span>
                <div className="text-sm font-medium text-text-primary font-mono mt-1">
                  {repo?.openPRs} / {repo?.openIssues} issues
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>Last activity: {formatTimestamp(repo?.lastActivity)}</span>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full bg-${getDeploymentStatusColor(repo?.deploymentStatus)}`} />
                <span>{repo?.deploymentStatus}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RepositorySummary;
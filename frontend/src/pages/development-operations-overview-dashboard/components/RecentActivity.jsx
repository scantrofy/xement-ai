import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLive, setIsLive] = useState(true);

  const activityTypes = [
    { id: 'all', label: 'All Activity', icon: 'Activity' },
    { id: 'commits', label: 'Commits', icon: 'GitCommit' },
    { id: 'prs', label: 'Pull Requests', icon: 'GitPullRequest' },
    { id: 'merges', label: 'Merges', icon: 'GitMerge' },
    { id: 'reviews', label: 'Reviews', icon: 'MessageSquare' }
  ];

  const generateMockActivities = () => {
    const mockActivities = [
      {
        id: 1,
        type: 'commit',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          username: 'sarah-chen'
        },
        action: 'committed',
        target: 'Fix authentication middleware bug',
        repository: 'backend-api',
        branch: 'feature/auth-fix',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        metadata: {
          commitHash: 'a1b2c3d',
          filesChanged: 3,
          additions: 45,
          deletions: 12
        }
      },
      {
        id: 2,
        type: 'pr',
        author: {
          name: 'Mike Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
          username: 'mike-rodriguez'
        },
        action: 'opened pull request',
        target: 'Add user dashboard analytics',
        repository: 'frontend-app',
        branch: 'feature/dashboard-analytics',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        metadata: {
          prNumber: 156,
          status: 'open',
          reviewers: ['emily-johnson', 'david-kim'],
          labels: ['enhancement', 'frontend']
        }
      },
      {
        id: 3,
        type: 'review',
        author: {
          name: 'Emily Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
          username: 'emily-johnson'
        },
        action: 'approved',
        target: 'Update API documentation',
        repository: 'backend-api',
        branch: 'docs/api-update',
        timestamp: new Date(Date.now() - 1200000), // 20 minutes ago
        metadata: {
          prNumber: 154,
          reviewType: 'approved',
          comments: 2
        }
      },
      {
        id: 4,
        type: 'merge',
        author: {
          name: 'David Kim',
          avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
          username: 'david-kim'
        },
        action: 'merged',
        target: 'Optimize database queries',
        repository: 'backend-api',
        branch: 'performance/db-optimization',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        metadata: {
          prNumber: 152,
          mergeType: 'squash',
          deploymentStatus: 'pending'
        }
      },
      {
        id: 5,
        type: 'commit',
        author: {
          name: 'Lisa Wang',
          avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
          username: 'lisa-wang'
        },
        action: 'committed',
        target: 'Add unit tests for payment module',
        repository: 'backend-api',
        branch: 'test/payment-tests',
        timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
        metadata: {
          commitHash: 'x7y8z9a',
          filesChanged: 5,
          additions: 120,
          deletions: 8
        }
      },
      {
        id: 6,
        type: 'pr',
        author: {
          name: 'Sarah Chen',
          avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
          username: 'sarah-chen'
        },
        action: 'requested review',
        target: 'Implement dark mode toggle',
        repository: 'frontend-app',
        branch: 'feature/dark-mode',
        timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
        metadata: {
          prNumber: 155,
          status: 'review_requested',
          reviewers: ['mike-rodriguez'],
          labels: ['ui', 'enhancement']
        }
      }
    ];

    return mockActivities;
  };

  useEffect(() => {
    setActivities(generateMockActivities());
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ['commit', 'pr', 'review', 'merge']?.[Math.floor(Math.random() * 4)],
        author: {
          name: ['Sarah Chen', 'Mike Rodriguez', 'Emily Johnson', 'David Kim', 'Lisa Wang']?.[Math.floor(Math.random() * 5)],
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 10) + 1}.jpg`,
          username: 'developer'
        },
        action: 'committed',
        target: 'Real-time activity update',
        repository: ['frontend-app', 'backend-api', 'mobile-app']?.[Math.floor(Math.random() * 3)],
        branch: 'main',
        timestamp: new Date(),
        metadata: {}
      };

      setActivities(prev => [newActivity, ...prev?.slice(0, 19)]); // Keep only 20 items
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const filteredActivities = activities?.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'commits') return activity?.type === 'commit';
    if (filter === 'prs') return activity?.type === 'pr';
    if (filter === 'merges') return activity?.type === 'merge';
    if (filter === 'reviews') return activity?.type === 'review';
    return true;
  });

  const getActivityIcon = (type) => {
    const iconMap = {
      commit: 'GitCommit',
      pr: 'GitPullRequest',
      merge: 'GitMerge',
      review: 'MessageSquare'
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      commit: 'primary',
      pr: 'secondary',
      merge: 'success',
      review: 'warning'
    };
    return colorMap?.[type] || 'primary';
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

  return (
    <div className="bg-surface border border-border-medium rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-success pulse-live' : 'bg-text-secondary'}`} />
            <h2 className="text-lg font-semibold text-text-primary font-mono">
              Real-time Activity
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-smooth ${
              isLive 
                ? 'bg-success/10 text-success border border-success/20' :'bg-surface-light text-text-secondary border border-border-medium'
            }`}
          >
            {isLive ? 'Live' : 'Paused'}
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="RefreshCw" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-background rounded-lg p-1">
        {activityTypes?.map((type) => (
          <button
            key={type?.id}
            onClick={() => setFilter(type?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-mono transition-smooth ${
              filter === type?.id
                ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            }`}
          >
            <Icon name={type?.icon} size={14} strokeWidth={2} />
            <span>{type?.label}</span>
          </button>
        ))}
      </div>
      {/* Activity Feed - Horizontal Cards Layout */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredActivities?.slice(0, 8)?.map((activity) => (
            <div
              key={activity?.id}
              className="bg-background border border-border-light rounded-lg p-4 hover:border-primary/30 transition-smooth cursor-pointer group h-full"
            >
              {/* Activity Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={activity?.author?.avatar}
                    alt={activity?.author?.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <div className={`w-4 h-4 rounded-full bg-${getActivityColor(activity?.type)}/20 flex items-center justify-center flex-shrink-0`}>
                    <Icon 
                      name={getActivityIcon(activity?.type)} 
                      size={10} 
                      className={`text-${getActivityColor(activity?.type)}`}
                      strokeWidth={2} 
                    />
                  </div>
                </div>
                <span className="text-xs text-text-secondary font-mono whitespace-nowrap">
                  {formatTimestamp(activity?.timestamp)}
                </span>
              </div>

              {/* Activity Content */}
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-text-primary font-mono truncate">
                    {activity?.author?.name}
                  </span>
                  <span className="text-xs text-text-secondary font-mono">
                    {activity?.action}
                  </span>
                </div>
                
                <p className="text-sm text-text-primary font-mono font-medium leading-relaxed line-clamp-2 mb-2">
                  {activity?.target}
                </p>
                
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  <span className="inline-flex items-center space-x-1 bg-surface-light px-2 py-1 rounded text-xs text-text-secondary font-mono">
                    <Icon name="Database" size={10} strokeWidth={2} />
                    <span className="truncate max-w-[80px]">{activity?.repository}</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 bg-surface-light px-2 py-1 rounded text-xs text-text-secondary font-mono">
                    <Icon name="GitBranch" size={10} strokeWidth={2} />
                    <span className="truncate max-w-[60px]">{activity?.branch}</span>
                  </span>
                </div>
              </div>

              {/* Activity Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1 text-xs text-text-secondary font-mono">
                  {activity?.metadata?.commitHash && (
                    <span className="bg-surface-light px-2 py-0.5 rounded">
                      {activity?.metadata?.commitHash}
                    </span>
                  )}
                  {activity?.metadata?.prNumber && (
                    <span className="bg-surface-light px-2 py-0.5 rounded">
                      #{activity?.metadata?.prNumber}
                    </span>
                  )}
                  {activity?.metadata?.additions && (
                    <span className="text-success">
                      +{activity?.metadata?.additions}
                    </span>
                  )}
                  {activity?.metadata?.deletions && (
                    <span className="text-error">
                      -{activity?.metadata?.deletions}
                    </span>
                  )}
                </div>
                
                <Icon 
                  name="ExternalLink" 
                  size={12} 
                  className="text-text-secondary group-hover:text-primary transition-smooth" 
                  strokeWidth={2} 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Show More Activities */}
        {filteredActivities?.length > 8 && (
          <div className="mt-4">
            <button className="w-full py-3 bg-background border border-border-light rounded-lg text-text-secondary hover:text-text-primary hover:border-primary/30 transition-smooth font-mono text-sm">
              Show More Activities ({filteredActivities?.length - 8} remaining)
            </button>
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between text-xs text-text-secondary font-mono">
          <span>Showing {Math.min(filteredActivities?.length, 8)} of {filteredActivities?.length} recent activities</span>
          <button className="text-primary hover:text-primary-400 transition-smooth">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
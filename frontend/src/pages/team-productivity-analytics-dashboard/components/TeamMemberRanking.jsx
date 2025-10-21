import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TeamMemberRanking = ({ members }) => {
  const [sortBy, setSortBy] = useState('score');
  const [viewMode, setViewMode] = useState('detailed');

  const sortOptions = [
    { id: 'score', name: 'Overall Score', icon: 'Award' },
    { id: 'commits', name: 'Commits', icon: 'GitCommit' },
    { id: 'prsCreated', name: 'PRs Created', icon: 'GitPullRequest' },
    { id: 'prsReviewed', name: 'PRs Reviewed', icon: 'Eye' }
  ];

  const sortedMembers = [...members]?.sort((a, b) => {
    if (sortBy === 'score') return b?.score - a?.score;
    return b?.[sortBy] - a?.[sortBy];
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return { icon: 'TrendingUp', color: 'text-success' };
      case 'down':
        return { icon: 'TrendingDown', color: 'text-error' };
      default:
        return { icon: 'Minus', color: 'text-text-secondary' };
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return { bg: 'bg-accent', text: 'text-white', icon: 'Crown' };
    if (index === 1) return { bg: 'bg-text-secondary', text: 'text-white', icon: 'Medal' };
    if (index === 2) return { bg: 'bg-accent-600', text: 'text-white', icon: 'Award' };
    return { bg: 'bg-surface-light', text: 'text-text-secondary', icon: 'User' };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-accent';
    if (score >= 70) return 'text-secondary';
    return 'text-text-secondary';
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Team Member Ranking
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Performance indicators and contribution metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
            className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light"
          >
            <Icon name={viewMode === 'detailed' ? 'List' : 'Grid'} size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Sort Options */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sortOptions?.map((option) => (
          <button
            key={option?.id}
            onClick={() => setSortBy(option?.id)}
            className={`flex items-center space-x-2 px-3 py-1 text-sm font-mono rounded-lg border transition-smooth ${
              sortBy === option?.id
                ? 'border-primary bg-primary/10 text-primary' :'border-border-medium text-text-secondary hover:text-text-primary hover:bg-surface-light'
            }`}
          >
            <Icon name={option?.icon} size={14} strokeWidth={2} />
            <span>{option?.name}</span>
          </button>
        ))}
      </div>
      {/* Team Members List */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-4 min-w-max">
          {sortedMembers?.map((member, index) => {
            const rankBadge = getRankBadge(index);
            const trendInfo = getTrendIcon(member?.trend);
            const scoreColor = getScoreColor(member?.score);

            return (
              <div
                key={member?.id}
                className="bg-background rounded-lg border border-border-medium p-4 hover:bg-surface-light transition-smooth flex-shrink-0 w-80"
              >
                {viewMode === 'detailed' ? (
                  <>
                    {/* Detailed View */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {/* Rank Badge */}
                        <div className={`w-8 h-8 ${rankBadge?.bg} rounded-full flex items-center justify-center`}>
                          <span className={`text-sm font-bold ${rankBadge?.text} font-mono`}>
                            {index + 1}
                          </span>
                        </div>

                        {/* Avatar and Name */}
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={member?.avatar}
                            alt={member?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary font-mono">
                            {member?.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${scoreColor} font-mono`}>
                              {member?.score}
                            </span>
                            <Icon 
                              name={trendInfo?.icon} 
                              size={14} 
                              className={trendInfo?.color} 
                              strokeWidth={2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary font-mono">Commits</span>
                          <Icon name="GitCommit" size={12} className="text-primary" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-bold text-text-primary font-mono">
                          {member?.commits}
                        </span>
                      </div>

                      <div className="bg-surface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary font-mono">PRs Created</span>
                          <Icon name="GitPullRequest" size={12} className="text-secondary" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-bold text-text-primary font-mono">
                          {member?.prsCreated}
                        </span>
                      </div>

                      <div className="bg-surface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary font-mono">PRs Reviewed</span>
                          <Icon name="Eye" size={12} className="text-accent" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-bold text-text-primary font-mono">
                          {member?.prsReviewed}
                        </span>
                      </div>

                      <div className="bg-surface rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-secondary font-mono">Lines Added</span>
                          <Icon name="Plus" size={12} className="text-success" strokeWidth={2} />
                        </div>
                        <span className="text-sm font-bold text-text-primary font-mono">
                          {member?.linesAdded?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Mini Bar Chart */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-secondary font-mono">Activity Distribution</span>
                        <span className="text-xs text-text-secondary font-mono">
                          {((member?.linesAdded / (member?.linesAdded + member?.linesRemoved)) * 100)?.toFixed(1)}% additions
                        </span>
                      </div>
                      <div className="flex space-x-1 h-2">
                        <div 
                          className="bg-success rounded-sm"
                          style={{ 
                            width: `${(member?.linesAdded / (member?.linesAdded + member?.linesRemoved)) * 100}%` 
                          }}
                        />
                        <div 
                          className="bg-error rounded-sm"
                          style={{ 
                            width: `${(member?.linesRemoved / (member?.linesAdded + member?.linesRemoved)) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Compact View */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 ${rankBadge?.bg} rounded-full flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${rankBadge?.text} font-mono`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={member?.avatar}
                            alt={member?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-text-primary font-mono">
                            {member?.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary font-mono">
                            <span>{member?.commits} commits</span>
                            <span>{member?.prsCreated} PRs</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${scoreColor} font-mono`}>
                          {member?.score}
                        </span>
                        <Icon 
                          name={trendInfo?.icon} 
                          size={14} 
                          className={trendInfo?.color} 
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border-medium">
        <div className="flex items-center justify-between text-sm text-text-secondary font-mono">
          <span>Showing {members?.length} team members</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Additions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-error rounded-full"></div>
              <span>Deletions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberRanking;
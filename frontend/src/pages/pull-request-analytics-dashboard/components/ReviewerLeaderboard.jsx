import React from 'react';
import Icon from '../../../components/AppIcon';

const ReviewerLeaderboard = ({ pullRequests, authors }) => {
  // Calculate reviewer metrics
  const calculateReviewerMetrics = () => {
    const reviewerStats = {};
    
    pullRequests?.forEach(pr => {
      pr?.reviewers?.forEach(reviewerId => {
        if (!reviewerStats?.[reviewerId]) {
          reviewerStats[reviewerId] = {
            id: reviewerId,
            totalReviews: 0,
            avgResponseTime: 0,
            approvals: 0,
            changesRequested: 0,
            responseTimes: []
          };
        }
        
        reviewerStats[reviewerId].totalReviews++;
        
        // Mock response time calculation
        const responseTime = Math.random() * 24 + 1; // 1-25 hours
        reviewerStats?.[reviewerId]?.responseTimes?.push(responseTime);
        
        // Mock approval/changes data
        if (Math.random() > 0.3) {
          reviewerStats[reviewerId].approvals++;
        } else {
          reviewerStats[reviewerId].changesRequested++;
        }
      });
    });
    
    // Calculate average response times and sort by performance
    const reviewerList = Object.values(reviewerStats)?.map(reviewer => {
      const avgResponseTime = reviewer?.responseTimes?.reduce((sum, time) => sum + time, 0) / reviewer?.responseTimes?.length;
      const approvalRate = (reviewer?.approvals / reviewer?.totalReviews) * 100;
      
      return {
        ...reviewer,
        avgResponseTime: avgResponseTime || 0,
        approvalRate: approvalRate || 0,
        author: authors?.find(a => a?.id === reviewer?.id)
      };
    })?.filter(reviewer => reviewer?.author);
    
    // Sort by total reviews (workload) and response time
    return reviewerList?.sort((a, b) => {
      if (b?.totalReviews !== a?.totalReviews) {
        return b?.totalReviews - a?.totalReviews;
      }
      return a?.avgResponseTime - b?.avgResponseTime;
    });
  };

  const reviewerMetrics = calculateReviewerMetrics();

  const getResponseTimeColor = (responseTime) => {
    if (responseTime < 4) return 'text-success';
    if (responseTime < 12) return 'text-warning';
    return 'text-error';
  };

  const getWorkloadColor = (totalReviews) => {
    if (totalReviews < 3) return 'text-text-secondary';
    if (totalReviews < 6) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Reviewer Leaderboard
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Response time and workload metrics
          </p>
        </div>
        
        <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
          <Icon name="MoreVertical" size={16} strokeWidth={2} />
        </button>
      </div>
      {/* Leaderboard List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {reviewerMetrics?.slice(0, 8)?.map((reviewer, index) => (
          <div
            key={reviewer?.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-light transition-smooth border border-border-light min-h-[60px]"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 bg-background rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-text-primary font-mono">
                {index + 1}
              </span>
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={reviewer?.author?.avatar}
                alt={reviewer?.author?.name}
                className="w-10 h-10 rounded-full"
              />
            </div>

            {/* Reviewer Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text-primary font-mono truncate">
                  {reviewer?.author?.name}
                </h4>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} className="text-text-secondary" strokeWidth={2} />
                  <span className={`text-xs font-mono ${getResponseTimeColor(reviewer?.avgResponseTime)}`}>
                    {reviewer?.avgResponseTime?.toFixed(1)}h
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Icon name="GitPullRequest" size={12} className="text-text-secondary" strokeWidth={2} />
                    <span className={`text-xs font-mono ${getWorkloadColor(reviewer?.totalReviews)}`}>
                      {reviewer?.totalReviews}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Icon name="CheckCircle" size={12} className="text-success" strokeWidth={2} />
                    <span className="text-xs font-mono text-text-secondary">
                      {reviewer?.approvalRate?.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                {/* Workload Indicator */}
                <div className="flex items-center space-x-1">
                  <div className="w-12 h-1 bg-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        reviewer?.totalReviews < 3 ? 'bg-success' :
                        reviewer?.totalReviews < 6 ? 'bg-warning' : 'bg-error'
                      }`}
                      style={{ width: `${Math.min((reviewer?.totalReviews / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border-medium">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary font-mono">
              {(reviewerMetrics?.reduce((sum, r) => sum + r?.avgResponseTime, 0) / reviewerMetrics?.length || 0)?.toFixed(1)}h
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Avg Response Time
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary font-mono">
              {(reviewerMetrics?.reduce((sum, r) => sum + r?.approvalRate, 0) / reviewerMetrics?.length || 0)?.toFixed(0)}%
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Avg Approval Rate
            </div>
          </div>
        </div>
      </div>
      {/* Action Button */}
      <div className="mt-4">
        <button className="w-full py-2 text-sm font-mono text-text-secondary hover:text-text-primary transition-smooth border border-border-medium rounded-lg hover:bg-surface-light">
          View Detailed Analytics
        </button>
      </div>
    </div>
  );
};

export default ReviewerLeaderboard;
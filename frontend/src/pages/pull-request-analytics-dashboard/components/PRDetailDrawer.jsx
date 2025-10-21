import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PRDetailDrawer = ({ isOpen, onClose, pullRequest, authors }) => {
  const [activeTab, setActiveTab] = useState('timeline');

  if (!isOpen || !pullRequest) return null;

  const author = authors?.find(a => a?.id === pullRequest?.author);
  const reviewers = pullRequest?.reviewers?.map(id => authors?.find(a => a?.id === id))?.filter(Boolean);

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: 'Clock' },
    { id: 'comments', label: 'Comments', icon: 'MessageSquare' },
    { id: 'approvals', label: 'Approvals', icon: 'CheckCircle' },
    { id: 'files', label: 'Files', icon: 'FileText' }
  ];

  // Mock timeline data
  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      author: author,
      timestamp: pullRequest?.createdAt,
      description: 'Created pull request'
    },
    {
      id: 2,
      type: 'review_requested',
      author: author,
      timestamp: new Date(pullRequest.createdAt.getTime() + 30 * 60 * 1000),
      description: 'Requested review from team members',
      reviewers: reviewers?.slice(0, 2)
    },
    {
      id: 3,
      type: 'comment',
      author: reviewers?.[0],
      timestamp: new Date(pullRequest.createdAt.getTime() + 2 * 60 * 60 * 1000),
      description: 'Added review comment',
      comment: 'The authentication logic looks good, but we should add more error handling for edge cases.'
    },
    {
      id: 4,
      type: 'changes_requested',
      author: reviewers?.[1],
      timestamp: new Date(pullRequest.createdAt.getTime() + 4 * 60 * 60 * 1000),
      description: 'Requested changes',
      comment: 'Please update the unit tests to cover the new authentication flow.'
    },
    {
      id: 5,
      type: 'commit',
      author: author,
      timestamp: new Date(pullRequest.createdAt.getTime() + 6 * 60 * 60 * 1000),
      description: 'Pushed new commits',
      commits: ['Add error handling for auth failures', 'Update unit tests for auth flow']
    }
  ];

  // Mock comments data
  const comments = [
    {
      id: 1,
      author: reviewers?.[0],
      timestamp: new Date(pullRequest.createdAt.getTime() + 2 * 60 * 60 * 1000),
      content: `The authentication logic looks good overall. I like the approach you've taken with the token validation.

However, I think we should add more comprehensive error handling for edge cases like network timeouts and malformed responses.`,
      file: 'src/auth/AuthService.js',
      line: 45,
      resolved: false
    },
    {
      id: 2,
      author: reviewers?.[1],
      timestamp: new Date(pullRequest.createdAt.getTime() + 4 * 60 * 60 * 1000),
      content: `Please update the unit tests to cover the new authentication flow. We should test both success and failure scenarios.

Also, consider adding integration tests for the complete auth workflow.`,
      file: 'tests/auth.test.js',
      line: 12,
      resolved: false
    },
    {
      id: 3,
      author: author,
      timestamp: new Date(pullRequest.createdAt.getTime() + 5 * 60 * 60 * 1000),
      content: `Good points! I'll add the error handling and update the tests. Should have this ready in the next commit.`,
      resolved: true
    }
  ];

  // Mock file changes
  const fileChanges = [
    {
      file: 'src/auth/AuthService.js',
      additions: 45,
      deletions: 12,
      status: 'modified'
    },
    {
      file: 'src/components/LoginForm.jsx',
      additions: 23,
      deletions: 8,
      status: 'modified'
    },
    {
      file: 'tests/auth.test.js',
      additions: 67,
      deletions: 0,
      status: 'added'
    },
    {
      file: 'src/utils/tokenUtils.js',
      additions: 0,
      deletions: 34,
      status: 'deleted'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-warning';
      case 'merged': return 'text-success';
      case 'closed': return 'text-error';
      default: return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return 'GitPullRequest';
      case 'merged': return 'GitMerge';
      case 'closed': return 'X';
      default: return 'GitPullRequest';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-150"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed top-0 right-0 w-full max-w-2xl h-full bg-surface border-l border-border-medium z-200 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-border-medium p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <Icon 
                  name={getStatusIcon(pullRequest?.status)} 
                  size={20} 
                  className={getStatusColor(pullRequest?.status)}
                  strokeWidth={2}
                />
                <span className={`text-sm font-mono ${getStatusColor(pullRequest?.status)}`}>
                  {pullRequest?.status?.toUpperCase()}
                </span>
                <span className="text-sm text-text-secondary font-mono">
                  #{pullRequest?.id?.split('-')?.[1]}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold text-text-primary font-mono mb-2">
                {pullRequest?.title}
              </h2>
              
              <div className="flex items-center space-x-4 text-sm text-text-secondary font-mono">
                <div className="flex items-center space-x-2">
                  <img
                    src={author?.avatar}
                    alt={author?.name}
                    className="w-5 h-5 rounded-full"
                  />
                  <span>{author?.name}</span>
                </div>
                <span>•</span>
                <span>{formatTimeAgo(pullRequest?.createdAt)}</span>
                <span>•</span>
                <span>{pullRequest?.repository}</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light"
            >
              <Icon name="X" size={20} strokeWidth={2} />
            </button>
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-border-medium">
            <div className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={16} className="text-text-secondary" strokeWidth={2} />
              <span className="text-sm font-mono text-text-secondary">
                {pullRequest?.comments} comments
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" strokeWidth={2} />
              <span className="text-sm font-mono text-text-secondary">
                {pullRequest?.approvals} approvals
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-warning" strokeWidth={2} />
              <span className="text-sm font-mono text-text-secondary">
                {pullRequest?.changesRequested} changes requested
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-medium">
          <div className="flex space-x-0 px-6">
            {tabs?.map(tab => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-mono text-sm font-medium border-b-2 transition-smooth ${
                  activeTab === tab?.id
                    ? 'text-primary border-primary' :'text-text-secondary border-transparent hover:text-text-primary'
                }`}
              >
                <Icon name={tab?.icon} size={16} strokeWidth={2} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timelineEvents?.map(event => (
                <div key={event?.id} className="flex space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="Clock" size={14} className="text-primary" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <img
                        src={event?.author?.avatar}
                        alt={event?.author?.name}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-sm font-medium text-text-primary font-mono">
                        {event?.author?.name}
                      </span>
                      <span className="text-sm text-text-secondary font-mono">
                        {event?.description}
                      </span>
                    </div>
                    
                    <div className="text-xs text-text-secondary font-mono mb-2">
                      {formatTimeAgo(event?.timestamp)}
                    </div>
                    
                    {event?.comment && (
                      <div className="bg-background rounded-lg p-3 text-sm text-text-primary font-mono">
                        {event?.comment}
                      </div>
                    )}
                    
                    {event?.commits && (
                      <div className="space-y-1">
                        {event?.commits?.map((commit, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
                            <Icon name="GitCommit" size={12} strokeWidth={2} />
                            <span>{commit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {comments?.map(comment => (
                <div key={comment?.id} className="bg-background rounded-lg p-4 border border-border-medium">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={comment?.author?.avatar}
                        alt={comment?.author?.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm font-medium text-text-primary font-mono">
                        {comment?.author?.name}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">
                        {formatTimeAgo(comment?.timestamp)}
                      </span>
                    </div>
                    
                    {comment?.resolved && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs font-mono rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  {comment?.file && (
                    <div className="flex items-center space-x-2 mb-2 text-xs text-text-secondary font-mono">
                      <Icon name="FileText" size={12} strokeWidth={2} />
                      <span>{comment?.file}:{comment?.line}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-text-primary font-mono whitespace-pre-wrap">
                    {comment?.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-4">
              {reviewers?.map(reviewer => (
                <div key={reviewer?.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-medium">
                  <div className="flex items-center space-x-3">
                    <img
                      src={reviewer?.avatar}
                      alt={reviewer?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-sm font-medium text-text-primary font-mono">
                        {reviewer?.name}
                      </div>
                      <div className="text-xs text-text-secondary font-mono">
                        Requested reviewer
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} className="text-success" strokeWidth={2} />
                    <span className="text-sm text-success font-mono">Approved</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              {fileChanges?.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-medium">
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={file?.status === 'added' ? 'Plus' : file?.status === 'deleted' ? 'Minus' : 'Edit'} 
                      size={16} 
                      className={
                        file?.status === 'added' ? 'text-success' :
                        file?.status === 'deleted' ? 'text-error' : 'text-warning'
                      }
                      strokeWidth={2} 
                    />
                    <span className="text-sm font-mono text-text-primary">
                      {file?.file}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-xs font-mono">
                    {file?.additions > 0 && (
                      <span className="text-success">+{file?.additions}</span>
                    )}
                    {file?.deletions > 0 && (
                      <span className="text-error">-{file?.deletions}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PRDetailDrawer;
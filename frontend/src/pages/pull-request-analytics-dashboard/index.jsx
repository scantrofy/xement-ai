import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import HeaderControls from './components/HeaderControls';
import MetricsStrip from './components/MetricsStrip';
import PRVolumeChart from './components/PRVolumeChart';
import ReviewerLeaderboard from './components/ReviewerLeaderboard';
import WorkflowFunnel from './components/WorkflowFunnel';
import PRDetailDrawer from './components/PRDetailDrawer';

const PullRequestAnalyticsDashboard = () => {
  const [selectedRepository, setSelectedRepository] = useState('all');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(['open', 'merged', 'closed']);
  const [dateRange, setDateRange] = useState('last-30-days');
  const [selectedPR, setSelectedPR] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data for repositories
  const repositories = [
    { id: 'all', name: 'All Repositories' },
    { id: 'frontend-app', name: 'frontend-app' },
    { id: 'backend-api', name: 'backend-api' },
    { id: 'mobile-app', name: 'mobile-app' },
    { id: 'data-pipeline', name: 'data-pipeline' },
    { id: 'infrastructure', name: 'infrastructure' }
  ];

  // Mock data for authors
  const authors = [
    { id: 'sarah-chen', name: 'Sarah Chen', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
    { id: 'mike-johnson', name: 'Mike Johnson', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: 'alex-rodriguez', name: 'Alex Rodriguez', avatar: 'https://randomuser.me/api/portraits/men/28.jpg' },
    { id: 'emily-davis', name: 'Emily Davis', avatar: 'https://randomuser.me/api/portraits/women/41.jpg' },
    { id: 'david-kim', name: 'David Kim', avatar: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { id: 'lisa-wang', name: 'Lisa Wang', avatar: 'https://randomuser.me/api/portraits/women/29.jpg' }
  ];

  // Mock PR data
  const pullRequests = [
    {
      id: 'pr-1',
      title: 'Implement user authentication system',
      author: 'sarah-chen',
      repository: 'frontend-app',
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewTime: 4.2,
      size: 'large',
      labels: ['feature', 'authentication'],
      reviewers: ['mike-johnson', 'alex-rodriguez'],
      comments: 12,
      approvals: 1,
      changesRequested: 0
    },
    {
      id: 'pr-2',
      title: 'Fix memory leak in data processing',
      author: 'mike-johnson',
      repository: 'backend-api',
      status: 'merged',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      mergedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      reviewTime: 2.1,
      size: 'medium',
      labels: ['bugfix', 'performance'],
      reviewers: ['sarah-chen', 'david-kim'],
      comments: 8,
      approvals: 2,
      changesRequested: 1
    },
    {
      id: 'pr-3',
      title: 'Add mobile responsive design',
      author: 'emily-davis',
      repository: 'frontend-app',
      status: 'open',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      reviewTime: 1.5,
      size: 'large',
      labels: ['feature', 'ui/ux'],
      reviewers: ['lisa-wang', 'alex-rodriguez'],
      comments: 6,
      approvals: 0,
      changesRequested: 1
    },
    {
      id: 'pr-4',
      title: 'Update API documentation',
      author: 'david-kim',
      repository: 'backend-api',
      status: 'merged',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      mergedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      reviewTime: 0.8,
      size: 'small',
      labels: ['documentation'],
      reviewers: ['mike-johnson'],
      comments: 3,
      approvals: 1,
      changesRequested: 0
    },
    {
      id: 'pr-5',
      title: 'Implement CI/CD pipeline improvements',
      author: 'alex-rodriguez',
      repository: 'infrastructure',
      status: 'closed',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      reviewTime: 3.2,
      size: 'large',
      labels: ['infrastructure', 'ci/cd'],
      reviewers: ['sarah-chen', 'mike-johnson'],
      comments: 15,
      approvals: 0,
      changesRequested: 2
    }
  ];

  // Calculate metrics
  const calculateMetrics = () => {
    const filteredPRs = pullRequests?.filter(pr => {
      const repositoryMatch = selectedRepository === 'all' || pr?.repository === selectedRepository;
      const authorMatch = selectedAuthors?.length === 0 || selectedAuthors?.includes(pr?.author);
      const statusMatch = selectedStatuses?.includes(pr?.status);
      return repositoryMatch && authorMatch && statusMatch;
    });

    const totalPRs = filteredPRs?.length;
    const openPRs = filteredPRs?.filter(pr => pr?.status === 'open')?.length;
    const mergedPRs = filteredPRs?.filter(pr => pr?.status === 'merged')?.length;
    const closedPRs = filteredPRs?.filter(pr => pr?.status === 'closed')?.length;
    
    const avgReviewTime = filteredPRs?.reduce((sum, pr) => sum + pr?.reviewTime, 0) / filteredPRs?.length || 0;
    const mergeSuccessRate = totalPRs > 0 ? (mergedPRs / totalPRs) * 100 : 0;
    
    const totalReviewers = new Set(filteredPRs.flatMap(pr => pr.reviewers))?.size;
    const avgConflictTime = 1.8; // Mock data
    const approvalVelocity = 2.3; // Mock data

    return {
      totalPRs,
      openPRs,
      mergedPRs,
      closedPRs,
      avgReviewTime,
      mergeSuccessRate,
      totalReviewers,
      avgConflictTime,
      approvalVelocity
    };
  };

  const metrics = calculateMetrics();

  const handlePRSelect = (pr) => {
    setSelectedPR(pr);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedPR(null);
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 600000); // Update every 10 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-text-primary font-mono">
              Pull Request Analytics
            </h1>
            <p className="text-text-secondary font-mono mt-2">
              PR workflow optimization and review efficiency analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
              <div className="w-2 h-2 bg-success rounded-full pulse-live"></div>
              <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-smooth font-mono">
              <Icon name="RefreshCw" size={16} strokeWidth={2} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Header Controls */}
        <HeaderControls
          repositories={repositories}
          authors={authors}
          selectedRepository={selectedRepository}
          setSelectedRepository={setSelectedRepository}
          selectedAuthors={selectedAuthors}
          setSelectedAuthors={setSelectedAuthors}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Metrics Strip */}
        <MetricsStrip metrics={metrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-16 gap-6">
          {/* PR Volume Chart - 12 columns */}
          <div className="xl:col-span-12 h-[500px]">
            <PRVolumeChart 
              pullRequests={pullRequests}
              onPRSelect={handlePRSelect}
              selectedRepository={selectedRepository}
              selectedAuthors={selectedAuthors}
              selectedStatuses={selectedStatuses}
            />
          </div>

          {/* Reviewer Leaderboard - 4 columns */}
          <div className="xl:col-span-4 h-[600px]">
            <ReviewerLeaderboard 
              pullRequests={pullRequests}
              authors={authors}
            />
          </div>
        </div>

        {/* Workflow Funnel */}
        <div className="h-[600px]">
          <WorkflowFunnel 
            pullRequests={pullRequests}
            onPRSelect={handlePRSelect}
          />
        </div>
      </div>
      {/* PR Detail Drawer */}
      <PRDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        pullRequest={selectedPR}
        authors={authors}
      />
    </div>
  );
};

export default PullRequestAnalyticsDashboard;
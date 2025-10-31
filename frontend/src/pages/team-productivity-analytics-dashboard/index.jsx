import React, { useState, useEffect } from 'react';
import Icon from '../../components/AppIcon';
import VelocityTrendCards from './components/VelocityTrendCards';
import TeamVelocityChart from './components/TeamVelocityChart';
import TeamMemberRanking from './components/TeamMemberRanking';
import CorrelationMatrix from './components/CorrelationMatrix';
import FilterHeader from './components/FilterHeader';
import AdvancedAnalytics from './components/AdvancedAnalytics';

const TeamProductivityAnalyticsDashboard = () => {
  const [filters, setFilters] = useState({
    team: 'all',
    sprint: 'current',
    comparisonMode: 'team',
    dateRange: 'last-30-days',
    granularity: 'weekly'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const velocityMetrics = {
    commitsPerDeveloper: { value: 24.5, change: 12.3, trend: 'up' },
    prThroughput: { value: 18.2, change: -5.7, trend: 'down' },
    reviewParticipation: { value: 87.4, change: 8.9, trend: 'up' },
    deliveryPredictability: { value: 92.1, change: 3.2, trend: 'up' }
  };

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      commits: 156,
      prsCreated: 28,
      prsReviewed: 45,
      linesAdded: 12450,
      linesRemoved: 3200,
      score: 94.2,
      trend: 'up'
    },
    {
      id: 2,
      name: "Marcus Johnson",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      commits: 142,
      prsCreated: 32,
      prsReviewed: 38,
      linesAdded: 11200,
      linesRemoved: 2800,
      score: 91.8,
      trend: 'up'
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      commits: 134,
      prsCreated: 25,
      prsReviewed: 52,
      linesAdded: 9800,
      linesRemoved: 4100,
      score: 89.5,
      trend: 'stable'
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/38.jpg",
      commits: 128,
      prsCreated: 30,
      prsReviewed: 41,
      linesAdded: 10500,
      linesRemoved: 3600,
      score: 87.3,
      trend: 'down'
    },
    {
      id: 5,
      name: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/35.jpg",
      commits: 119,
      prsCreated: 22,
      prsReviewed: 48,
      linesAdded: 8900,
      linesRemoved: 3900,
      score: 85.7,
      trend: 'up'
    }
  ];

  const chartData = [
    { date: '2024-01-01', commits: 145, prs: 28, reviews: 42, velocity: 85.2 },
    { date: '2024-01-08', commits: 152, prs: 31, reviews: 45, velocity: 87.8 },
    { date: '2024-01-15', commits: 138, prs: 25, reviews: 38, velocity: 82.4 },
    { date: '2024-01-22', commits: 167, prs: 35, reviews: 51, velocity: 91.3 },
    { date: '2024-01-29', commits: 159, prs: 33, reviews: 47, velocity: 89.7 },
    { date: '2024-02-05', commits: 174, prs: 38, reviews: 54, velocity: 94.1 },
    { date: '2024-02-12', commits: 163, prs: 32, reviews: 49, velocity: 88.9 },
    { date: '2024-02-19', commits: 181, prs: 41, reviews: 58, velocity: 96.5 },
    { date: '2024-02-26', commits: 156, prs: 29, reviews: 44, velocity: 86.3 },
    { date: '2024-03-05', commits: 192, prs: 44, reviews: 62, velocity: 99.2 },
    { date: '2024-03-12', commits: 178, prs: 39, reviews: 56, velocity: 93.7 },
    { date: '2024-03-19', commits: 185, prs: 42, reviews: 59, velocity: 97.1 }
  ];

  const correlationData = [
    { metric1: 'Commits', metric2: 'PR Size', correlation: 0.72 },
    { metric1: 'Commits', metric2: 'Review Time', correlation: -0.45 },
    { metric1: 'Commits', metric2: 'Cycle Time', correlation: 0.38 },
    { metric1: 'PR Size', metric2: 'Review Time', correlation: 0.84 },
    { metric1: 'PR Size', metric2: 'Cycle Time', correlation: 0.91 },
    { metric1: 'Review Time', metric2: 'Cycle Time', correlation: 0.67 }
  ];

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setIsLoading(true);
  };

  const handleExportData = (format) => {
    // Mock export functionality
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary font-mono">Loading team analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary font-mono">
                Team Productivity Analytics
              </h1>
              <p className="text-text-secondary font-mono mt-2">
                Development velocity patterns and team performance insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
                <Icon name="Clock" size={16} strokeWidth={2} />
                <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportData('csv')}
                  className="px-4 py-2 bg-surface hover:bg-surface-light text-text-primary font-mono text-sm rounded-lg border border-border-medium transition-smooth flex items-center space-x-2"
                >
                  <Icon name="Download" size={16} strokeWidth={2} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleExportData('pdf')}
                  className="px-4 py-2 bg-primary hover:bg-primary-600 text-white font-mono text-sm rounded-lg transition-smooth flex items-center space-x-2"
                >
                  <Icon name="FileText" size={16} strokeWidth={2} />
                  <span>Executive Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Header */}
        <FilterHeader filters={filters} onFilterChange={handleFilterChange} />

        {/* Velocity Trend Cards */}
        <VelocityTrendCards metrics={velocityMetrics} />

        {/* Team Velocity Chart - Full Width */}
        <div className="mb-8">
          <TeamVelocityChart 
            data={chartData} 
            granularity={filters?.granularity}
            onGranularityChange={(granularity) => handleFilterChange({ granularity })}
          />
        </div>

        {/* Team Member Ranking - Full Width Horizontal */}
        <div className="mb-8">
          <TeamMemberRanking members={teamMembers} />
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Correlation Matrix */}
          <CorrelationMatrix data={correlationData} />

          {/* Advanced Analytics */}
          <AdvancedAnalytics />
        </div>

        {/* Footer Info */}
        <div className="bg-surface rounded-lg border border-border-medium p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-text-secondary font-mono">Data Quality: Excellent</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Database" size={16} className="text-text-secondary" strokeWidth={2} />
                <span className="text-sm text-text-secondary font-mono">
                  Historical data: 12+ months available
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
              <Icon name="RefreshCw" size={16} strokeWidth={2} />
              <span>Daily refresh at 6:00 AM UTC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamProductivityAnalyticsDashboard;
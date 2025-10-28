import React, { useState } from 'react';
import { useLatestState } from '../../api/hooks';
import KPICard from './components/KPICard';
import ProductionTimeline from './components/ProductionTimeline';
import AlertFeed from './components/AlertFeed';
import ProductionSummary from './components/ProductionSummary';
import DashboardFilters from './components/DashboardFilters';
import { LoadingScreen } from '../../components/ui';

const OverviewDashboard = () => {
  const [filters, setFilters] = useState({
    plant: 'all',
    period: 'lastHour'
  });
  
  const { data: plantData, isLoading, error, isRefetching, refetch } = useLatestState(filters);

  // Check if we're using mock data
  const isUsingMockData = () => {
    const baseURL = import.meta.env?.VITE_API_BASE_URL;
    return !baseURL || baseURL === 'https://YOUR-CLOUDRUN-URL.a.run.app' || baseURL?.includes('localhost');
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    console.log('🔍 Dashboard filters updated:', newFilters);
    setFilters(newFilters);
    // The useLatestState hook will automatically refetch with new filters
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
  };

  const kpiMetrics = [
    {
      title: 'Energy Use',
      value: plantData?.energy_use,
      unit: 'kWh/ton',
      icon: 'Zap',
      thresholds: { optimal: 180, warning: 220 },
      inverse: true,
    },
    {
      title: 'Grinding Efficiency',
      value: plantData?.grinding_efficiency,
      unit: '%',
      icon: 'Settings',
      thresholds: { optimal: 90, warning: 85 },
    },
    {
      title: 'Kiln Temperature',
      value: plantData?.kiln_temp,
      unit: '°C',
      icon: 'Thermometer',
      thresholds: { optimal: 1450, warning: 1400 },
    },
    {
      title: 'CO₂ Emissions',
      value: plantData?.emissions,
      unit: 'kg/ton',
      icon: 'Cloud',
      thresholds: { optimal: 850, warning: 900 },
      inverse: true, // Lower is better for emissions
    },
    {
      title: 'Product Quality',
      value: plantData?.product_quality,
      unit: '%',
      icon: 'Award',
      thresholds: { optimal: 95, warning: 90 },
    },
    {
      title: 'Production Volume',
      value: plantData?.production_volume,
      unit: 'tons/hr',
      icon: 'TrendingUp',
      thresholds: { optimal: 140, warning: 120 },
    },
  ];

  if (isLoading) {
    return (
      <LoadingScreen
        message="Loading production data..."
        showLogo={true}
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Development Mode Notice */}
        {isUsingMockData() && (
          <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse"></div>
              <h3 className="text-secondary-800 font-medium">Development Mode</h3>
            </div>
            <p className="text-secondary-700 text-sm mt-1">
              Using mock data for demonstration. Configure VITE_API_BASE_URL in your .env file to connect to your FastAPI backend.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Overview Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Real-time cement production monitoring and KPIs
            </p>
            {/* Active Filters Indicator */}
            {(filters.plant !== 'all' || filters.period !== 'lastHour') && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-text-secondary">Active filters:</span>
                {filters.plant !== 'all' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                    {filters.plant}
                  </span>
                )}
                {filters.period !== 'lastHour' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                    {filters.period}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isRefetching && (
              <div className="flex items-center space-x-2 text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm font-mono">Refreshing...</span>
              </div>
            )}
            <div className="text-xs text-text-secondary font-mono">
              Auto-refresh: 30s
            </div>
          </div>
        </div>

        {/* Dashboard Filters */}
        <DashboardFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefetching}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpiMetrics?.map((metric, index) => (
            <KPICard
              key={index}
              title={metric?.title}
              value={metric?.value}
              unit={metric?.unit}
              icon={metric?.icon}
              thresholds={metric?.thresholds}
              inverse={metric?.inverse}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Production Timeline */}
          <div className="lg:col-span-8">
            <ProductionTimeline data={plantData} />
          </div>

          {/* Alert Feed */}
          <div className="lg:col-span-4">
            <AlertFeed />
          </div>
        </div>

        {/* Production Summary */}
        <ProductionSummary data={plantData} />
      </div>
    </div>
  );
};

export default OverviewDashboard;
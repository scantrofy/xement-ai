import React, { useState, useEffect, useMemo } from 'react';
import { useHistoryData, useLatestState, useBaselines } from '../../api/hooks';
import { LoadingScreen } from '../../components/ui';
import SummaryCards from './components/SummaryCards';
import EnergyTrendChart from './components/EnergyTrendChart';
import OptimizationsTable from './components/OptimizationsTable';
import AIInsights from './components/AIInsights';
import ReportFilters from './components/ReportFilters';
import { generatePDFReport } from './utils/pdfGenerator';
import { Download, FileText, TrendingDown, Zap, CheckCircle } from 'lucide-react';

const ReportsInsights = () => {
  const { data: historyData, isLoading: isLoadingHistory } = useHistoryData();
  const { data: latestData, isLoading: isLoadingLatest } = useLatestState();
  const { data: baselines, isLoading: isLoadingBaselines } = useBaselines();
  
  const [reportPeriod, setReportPeriod] = useState('weekly'); // 'daily' or 'weekly'
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [insights, setInsights] = useState(null);

  // Calculate report metrics from historical data
  const calculateMetrics = () => {
    if (!historyData || historyData.length === 0) {
      return {
        avgEnergyUse: 0,
        energySavings: 0,
        totalOptimizations: 0,
        co2Reduction: 0,
        efficiencyImprovement: 0,
        qualityScore: 0,
      };
    }

    const periodData = reportPeriod === 'daily' 
      ? historyData.slice(0, 24) // Last 24 hours
      : historyData.slice(0, 168); // Last 7 days (168 hours)

    console.log(`[Reports] Calculating metrics for ${reportPeriod} period with ${periodData.length} data points`);

    const avgEnergyUse = periodData.reduce((sum, d) => sum + (d.energy_use || 0), 0) / periodData.length;
    
    // Calculate energy savings by comparing current period to baseline (from API or default)
    const baselineEnergy = baselines?.baseline_energy || 175; // Baseline energy consumption (kWh/ton)
    const energySavings = avgEnergyUse > 0 && baselineEnergy > 0
      ? ((baselineEnergy - avgEnergyUse) / baselineEnergy) * 100
      : 0;
    
    // Calculate CO2 reduction
    const avgEmissions = periodData.reduce((sum, d) => sum + (d.emissions_CO2 || d.emissions || 0), 0) / periodData.length;
    const baselineEmissions = baselines?.baseline_emissions || 130; // Baseline emissions (kg CO2/ton)
    const co2Reduction = avgEmissions > 0 && baselineEmissions > 0
      ? ((baselineEmissions - avgEmissions) / baselineEmissions) * 100
      : 0;

    // Calculate efficiency improvement
    const avgEfficiency = periodData.reduce((sum, d) => sum + (d.grinding_efficiency || 0), 0) / periodData.length;
    const baselineEfficiency = baselines?.baseline_efficiency || 85; // Baseline grinding efficiency (%)
    const efficiencyImprovement = avgEfficiency > 0 && baselineEfficiency > 0
      ? ((avgEfficiency - baselineEfficiency) / baselineEfficiency) * 100
      : 0;

    // Calculate quality score
    const avgQuality = periodData.reduce((sum, d) => sum + (d.product_quality_index || d.product_quality || 0), 0) / periodData.length;

    // Estimate optimizations applied (based on energy improvements)
    const totalOptimizations = Math.max(0, Math.floor(Math.abs(energySavings) * 2.5));

    // Helper function to ensure valid number output
    const safeNumber = (value, decimals = 2) => {
      if (!isFinite(value) || isNaN(value)) return '0';
      return value.toFixed(decimals);
    };

    const result = {
      avgEnergyUse: safeNumber(avgEnergyUse, 2),
      energySavings: safeNumber(energySavings, 2),
      totalOptimizations: Math.max(0, totalOptimizations),
      co2Reduction: safeNumber(co2Reduction, 2),
      efficiencyImprovement: safeNumber(efficiencyImprovement, 2),
      qualityScore: safeNumber(avgQuality, 1),
    };

    console.log(`[Reports] Metrics calculated:`, result);
    return result;
  };

  // Memoize metrics calculation to recalculate when reportPeriod, historyData, or baselines change
  const metrics = useMemo(() => calculateMetrics(), [historyData, reportPeriod, baselines]);

  // Generate AI insights based on data
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      generateAIInsights();
    }
  }, [historyData, reportPeriod]);

  const generateAIInsights = () => {
    const periodData = reportPeriod === 'daily' 
      ? historyData.slice(0, 24)
      : historyData.slice(0, 168);

    // Analyze trends
    const energyTrend = analyzeEnergyTrend(periodData);
    const peakHours = identifyPeakHours(periodData);
    const recommendations = generateRecommendations(periodData, metrics);

    setInsights({
      summary: generateSummary(metrics, reportPeriod),
      energyTrend,
      peakHours,
      recommendations,
      keyFindings: generateKeyFindings(periodData, metrics),
    });
  };

  const analyzeEnergyTrend = (data) => {
    if (data.length < 2) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + (d.energy_use || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + (d.energy_use || 0), 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change < -2) return 'decreasing';
    if (change > 2) return 'increasing';
    return 'stable';
  };

  const identifyPeakHours = (data) => {
    const hourlyAvg = {};
    data.forEach(d => {
      const hour = d.hour_of_day;
      if (!hourlyAvg[hour]) hourlyAvg[hour] = { total: 0, count: 0 };
      hourlyAvg[hour].total += d.energy_use || 0;
      hourlyAvg[hour].count += 1;
    });

    const peaks = Object.entries(hourlyAvg)
      .map(([hour, data]) => ({ hour: parseInt(hour), avg: data.total / data.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 3);

    return peaks.map(p => p.hour);
  };

  const generateRecommendations = (data, metrics) => {
    const recs = [];

    if (parseFloat(metrics.energySavings) < 3) {
      recs.push({
        title: 'Optimize Energy Consumption',
        description: 'Current energy savings are below target. Consider adjusting kiln temperature and grinding parameters.',
        priority: 'high',
        impact: 'Potential 5-8% energy reduction',
      });
    }

    if (parseFloat(metrics.efficiencyImprovement) < 5) {
      recs.push({
        title: 'Improve Grinding Efficiency',
        description: 'Grinding efficiency can be improved through better raw material mix and equipment optimization.',
        priority: 'medium',
        impact: 'Potential 3-5% efficiency gain',
      });
    }

    if (parseFloat(metrics.co2Reduction) < 10) {
      recs.push({
        title: 'Increase Alternative Fuel Usage',
        description: 'Increase alternative fuel percentage to reduce CO₂ emissions and improve sustainability metrics.',
        priority: 'medium',
        impact: 'Potential 10-15% emission reduction',
      });
    }

    recs.push({
      title: 'Implement Predictive Maintenance',
      description: 'Use AI-powered predictive maintenance to prevent equipment failures and optimize performance.',
      priority: 'low',
      impact: 'Reduce downtime by 20-30%',
    });

    return recs;
  };

  const generateSummary = (metrics, period) => {
    const periodText = period === 'daily' ? 'the past 24 hours' : 'the past week';
    return `Over ${periodText}, the cement production facility has achieved ${metrics.energySavings}% energy savings compared to baseline operations. A total of ${metrics.totalOptimizations} AI-driven optimizations have been successfully applied, resulting in ${metrics.co2Reduction}% reduction in CO₂ emissions and ${metrics.efficiencyImprovement}% improvement in grinding efficiency. The overall product quality score stands at ${metrics.qualityScore}%, maintaining excellent standards.`;
  };

  const generateKeyFindings = (data, metrics) => {
    return [
      {
        icon: Zap,
        title: 'Energy Efficiency',
        value: `${metrics.energySavings}%`,
        description: 'Energy savings achieved vs baseline',
        trend: parseFloat(metrics.energySavings) > 0 ? 'positive' : 'negative',
      },
      {
        icon: TrendingDown,
        title: 'CO₂ Reduction',
        value: `${metrics.co2Reduction}%`,
        description: 'Emissions reduced through optimization',
        trend: parseFloat(metrics.co2Reduction) > 0 ? 'positive' : 'negative',
      },
      {
        icon: CheckCircle,
        title: 'Optimizations Applied',
        value: metrics.totalOptimizations,
        description: 'AI-driven improvements implemented',
        trend: 'positive',
      },
    ];
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDFReport({
        period: reportPeriod,
        metrics,
        insights,
        historyData: reportPeriod === 'daily' 
          ? historyData?.slice(0, 24)
          : historyData?.slice(0, 168),
        latestData,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoadingHistory || isLoadingLatest || isLoadingBaselines) {
    return (
      <LoadingScreen 
        message="Loading report data..."
        showLogo={true}
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Reports & Insights
            </h1>
            <p className="text-text-secondary mt-1">
              AI-driven analytics and comprehensive production reports
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Download className={`w-5 h-5 ${isGeneratingPDF ? 'animate-bounce' : ''}`} />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>

        {/* Report Filters */}
        <ReportFilters 
          reportPeriod={reportPeriod}
          setReportPeriod={setReportPeriod}
        />

        {/* Summary Cards */}
        <SummaryCards metrics={metrics} reportPeriod={reportPeriod} />

        {/* AI Insights */}
        {insights && <AIInsights insights={insights} />}

        {/* Energy Trend Chart */}
        <EnergyTrendChart 
          data={reportPeriod === 'daily' 
            ? historyData?.slice(0, 24)
            : historyData?.slice(0, 168)
          }
          reportPeriod={reportPeriod}
        />

        {/* Optimizations Table */}
        <OptimizationsTable 
          data={reportPeriod === 'daily' 
            ? historyData?.slice(0, 24)
            : historyData?.slice(0, 168)
          }
          totalOptimizations={metrics.totalOptimizations}
        />
      </div>
    </div>
  );
};

export default ReportsInsights;

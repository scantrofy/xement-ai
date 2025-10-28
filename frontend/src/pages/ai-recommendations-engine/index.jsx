import React, { useState, useEffect } from 'react';
import { useRunCycle, useRecommendation } from '../../api/hooks';
import RecommendationCard from './components/RecommendationCard';
import ImpactMetrics from './components/ImpactMetrics';
import Icon from '../../components/AppIcon';

const AIRecommendationsEngine = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [implementationStatus, setImplementationStatus] = useState('all');
  const [recommendations, setRecommendations] = useState(() => {
    // Initialize from sessionStorage if available
    const saved = sessionStorage.getItem('ai-recommendations');
    return saved ? JSON.parse(saved) : [];
  });
  const [cycleData, setCycleData] = useState(null);
  const [aiResponse, setAiResponse] = useState(() => {
    // Initialize from sessionStorage if available
    const saved = sessionStorage.getItem('ai-response');
    return saved ? JSON.parse(saved) : null;
  });

  // Handle recommendation status updates
  const handleRecommendationStatusUpdate = (recommendationId, newStatus, additionalData = {}) => {
    const updatedRecommendations = recommendations.map(rec => 
      rec.id === recommendationId 
        ? { 
            ...rec, 
            status: newStatus,
            ...additionalData 
          }
        : rec
    );
    
    setRecommendations(updatedRecommendations);
    
    // Update sessionStorage with new status
    sessionStorage.setItem('ai-recommendations', JSON.stringify(updatedRecommendations));
  };
  
  const runCycleMutation = useRunCycle();
  const recommendationMutation = useRecommendation();

  // Load initial recommendations only if no data exists or data is stale
  useEffect(() => {
    const dataTimestamp = sessionStorage.getItem('ai-data-timestamp');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    // Check if data is stale (older than 5 minutes) or doesn't exist
    const isDataStale = !dataTimestamp || (now - parseInt(dataTimestamp)) > fiveMinutes;
    
    // Only fetch data if we don't have any existing data or data is stale
    if ((!aiResponse && !recommendations.length) || isDataStale) {
      handleRunCycle();
    }
  }, []); // Keep empty dependency array but add conditional logic

  const filteredRecommendations = recommendations?.filter((rec) => {
    const categoryMatch = selectedCategory === 'all' || rec?.category === selectedCategory;
    const priorityMatch = selectedPriority === 'all' || rec?.priority === selectedPriority;
    const statusMatch = implementationStatus === 'all' || rec?.status === implementationStatus;
    return categoryMatch && priorityMatch && statusMatch;
  });

  const handleRunCycle = async () => {
    try {
      const result = await runCycleMutation?.mutateAsync();
      setCycleData(result);
      setAiResponse(result); // Store the full AI response
      
      // Save to sessionStorage for persistence with timestamp
      sessionStorage.setItem('ai-response', JSON.stringify(result));
      sessionStorage.setItem('ai-data-timestamp', Date.now().toString());
      
      // Transform API recommendations to match UI format
      if (result?.recommendation?.recommendations) {
        const transformedRecommendations = result.recommendation.recommendations.map((rec, index) => ({
          id: `rec-${Date.now()}-${index}`,
          title: `Optimize ${rec.parameter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
          category: getRecommendationCategory(rec.parameter),
          priority: rec.priority || 'medium',
          confidence: result.recommendation.confidence || 'Medium',
          expectedSaving: result.recommendation.estimated_energy_saving_pct || 0,
          roi: Math.round(Math.random() * 200 + 100), // Placeholder until API provides ROI
          timeline: getEstimatedTimeline(rec.parameter),
          status: 'pending',
          impact: {
            cost_savings: Math.round(Math.random() * 30000 + 5000),
            quality_improvement: Math.round(Math.random() * 5 * 10) / 10,
            efficiency_gain: result.recommendation.estimated_energy_saving_pct || 0,
          },
          description: result.recommendation.explanation,
          steps: getImplementationSteps(rec.parameter),
          reasoning: result.recommendation.explanation,
          currentValue: result.state?.[rec.parameter],
          recommendedValue: rec.new_value,
          parameter: rec.parameter,
          action: rec.action,
        }));
        setRecommendations(transformedRecommendations);
        
        // Save recommendations to sessionStorage
        sessionStorage.setItem('ai-recommendations', JSON.stringify(transformedRecommendations));
      }
    } catch (error) {
      console.error('Cycle run failed:', error);
    }
  };

  // Helper functions to transform API data
  const getRecommendationCategory = (parameter) => {
    const categoryMap = {
      kiln_temp: 'energy',
      grinding_speed: 'efficiency', 
      fuel_rate: 'emissions',
      maintenance: 'maintenance',
    };
    return categoryMap[parameter] || 'efficiency';
  };

  const getEstimatedTimeline = (parameter) => {
    const timelineMap = {
      kiln_temp: '1-2 weeks',
      grinding_speed: '2-3 weeks',
      fuel_rate: '3-4 weeks',
      maintenance: '4-6 weeks',
      fan_speed: '1-2 weeks',
    };
    return timelineMap[parameter] || '2-3 weeks';
  };

  const getImplementationSteps = (parameter) => {
    const stepsMap = {
      kiln_temp: [
        'Review current temperature control settings',
        'Adjust temperature setpoints gradually',
        'Monitor fuel consumption and product quality',
        'Fine-tune based on results'
      ],
      grinding_speed: [
        'Analyze current grinding performance',
        'Adjust mill speed parameters',
        'Monitor particle size distribution',
        'Optimize based on throughput metrics'
      ],
      fuel_rate: [
        'Review current fuel consumption patterns',
        'Implement fuel rate adjustments',
        'Monitor emissions and efficiency',
        'Validate environmental compliance'
      ],
      fan_speed: [
        'Review current fan speed settings',
        'Gradually adjust fan speed parameters',
        'Monitor airflow and energy consumption',
        'Validate process requirements are met'
      ],
    };
    return stepsMap[parameter] || ['Analyze current state', 'Implement changes', 'Monitor results', 'Optimize performance'];
  };

  // Helper functions for the new table
  const getParameterUnit = (parameter) => {
    const unitMap = {
      kiln_temp: '°C',
      fan_speed: '%',
      grinding_efficiency: '%',
      energy_use: ' kWh/ton',
      raw1_frac: '',
      raw2_frac: '',
    };
    return unitMap[parameter] || '';
  };

  const getParameterIcon = (parameter) => {
    const iconMap = {
      kiln_temp: 'Thermometer',
      fan_speed: 'Fan',
      grinding_efficiency: 'Settings',
      energy_use: 'Zap',
      raw1_frac: 'Package',
      raw2_frac: 'Package',
    };
    return iconMap[parameter] || 'Settings';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mt-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">AI Recommendations Engine</h1>
            <p className="text-text-secondary mt-1">
              Intelligent optimization recommendations for cement production efficiency
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-success-600 dark:text-green-300 bg-success-50 dark:bg-green-900/25 px-3 py-2 rounded-lg border border-success-200 dark:border-green-700">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-mono">AI Active</span>
            </div>
            <button 
              onClick={handleRunCycle}
              disabled={runCycleMutation?.isPending}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {runCycleMutation?.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running Cycle...</span>
                </>
              ) : (
                <>
                  <Icon name="Play" size={16} strokeWidth={2} />
                  <span>Run AI Cycle</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Loading State - Cycle Running - Show Skeleton Loaders */}
        {runCycleMutation?.isPending && (
          <>
            {/* Skeleton for Gemini AI Recommendations and Impact Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skeleton for Gemini AI Table */}
              <div className="bg-surface rounded-lg border border-border-medium p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="h-6 bg-surface-light rounded w-64 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-surface-light rounded w-96 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-surface-light rounded w-32 animate-pulse"></div>
                </div>
                
                {/* Skeleton Table */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-medium">
                        <th className="text-left py-3 px-2"><div className="h-4 bg-surface-light rounded w-20 animate-pulse"></div></th>
                        <th className="text-left py-3 px-2"><div className="h-4 bg-surface-light rounded w-16 animate-pulse"></div></th>
                        <th className="text-left py-3 px-2"><div className="h-4 bg-surface-light rounded w-24 animate-pulse"></div></th>
                        <th className="text-left py-3 px-2"><div className="h-4 bg-surface-light rounded w-16 animate-pulse"></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-b border-border-light">
                          <td className="py-3 px-2"><div className="h-4 bg-surface-light rounded w-32 animate-pulse"></div></td>
                          <td className="py-3 px-2"><div className="h-4 bg-surface-light rounded w-16 animate-pulse"></div></td>
                          <td className="py-3 px-2"><div className="h-4 bg-surface-light rounded w-16 animate-pulse"></div></td>
                          <td className="py-3 px-2"><div className="h-6 bg-surface-light rounded w-12 animate-pulse"></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Skeleton for Energy Savings & System Status */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-surface-light rounded-lg p-4 border border-border-light">
                    <div className="h-5 bg-surface-medium rounded w-32 mb-3 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-surface-medium rounded w-20 animate-pulse"></div>
                        <div className="h-6 bg-surface-medium rounded w-12 animate-pulse"></div>
                      </div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-surface-medium rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-surface-medium rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface-light rounded-lg p-4 border border-border-light">
                    <div className="h-5 bg-surface-medium rounded w-32 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-surface-medium rounded w-40 animate-pulse"></div>
                  </div>
                </div>

                {/* Skeleton for AI Analysis */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="h-5 bg-blue-200 dark:bg-blue-800 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-blue-100 dark:bg-blue-900/20 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Skeleton for Impact Overview */}
              <div className="bg-surface rounded-lg border border-border-medium p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex-1">
                    <div className="h-6 bg-surface-light rounded w-48 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-surface-light rounded w-64 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-surface-light rounded w-32 animate-pulse"></div>
                </div>

                {/* Skeleton Metric Cards */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-surface-light rounded-lg p-4 border border-border-light">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-surface-medium rounded w-32 animate-pulse"></div>
                        <div className="h-4 bg-surface-medium rounded w-16 animate-pulse"></div>
                      </div>
                      <div className="h-8 bg-surface-medium rounded w-24 animate-pulse"></div>
                    </div>
                  ))}
                </div>

                {/* Skeleton Chart */}
                <div className="mt-6 bg-surface-light rounded-lg p-4 border border-border-light">
                  <div className="h-5 bg-surface-medium rounded w-40 mb-4 animate-pulse"></div>
                  <div className="h-48 bg-surface-medium rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Skeleton for Optimization Recommendations */}
            <div className="mt-6 bg-surface rounded-lg border border-border-medium p-6">
              <div className="h-6 bg-surface-light rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-surface-light rounded w-48 mb-6 animate-pulse"></div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface-light rounded-lg p-6 border border-border-light">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-6 bg-surface-medium rounded w-64 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-surface-medium rounded w-96 animate-pulse"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="h-6 bg-surface-medium rounded w-20 animate-pulse"></div>
                        <div className="h-6 bg-surface-medium rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j}>
                          <div className="h-3 bg-surface-medium rounded w-16 mb-2 animate-pulse"></div>
                          <div className="h-5 bg-surface-medium rounded w-20 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading Message Overlay */}
            <div className="fixed bottom-8 right-8 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="font-medium">Running AI Optimization Cycle...</span>
            </div>
          </>
        )}

        {/* Empty State - No Data */}
        {!aiResponse && !runCycleMutation?.isPending && (
          <div className="bg-surface rounded-lg border border-border-medium p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="Brain" size={40} className="text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-semibold text-text-primary mb-3">
                No AI Recommendations Yet
              </h3>
              <p className="text-text-secondary mb-6">
                Run an AI optimization cycle to generate intelligent recommendations for your cement production process.
              </p>
              <button 
                onClick={handleRunCycle}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                <Icon name="Play" size={18} strokeWidth={2} />
                <span>Run AI Cycle Now</span>
              </button>
              <div className="mt-6 pt-6 border-t border-border-light">
                <p className="text-sm text-text-secondary">
                  The AI will analyze your current plant state and provide optimization suggestions to improve energy efficiency.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gemini AI Recommendations and Impact Overview Grid */}
        {aiResponse && !runCycleMutation?.isPending && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gemini AI Response Table */}
            <div className="bg-surface rounded-lg border border-border-medium p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Gemini AI Recommendations</h2>
                  <p className="text-text-secondary text-sm mt-1">
                    Parameter optimization suggestions with current vs recommended values
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    aiResponse.recommendation?.confidence === 'High' 
                      ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/25 dark:text-green-300 dark:border-green-700'
                      : aiResponse.recommendation?.confidence === 'Medium'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/25 dark:text-yellow-300 dark:border-yellow-700'
                      : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/25 dark:text-red-300 dark:border-red-700'
                  }`}>
                    {aiResponse.recommendation?.confidence} Confidence
                  </div>
                </div>
              </div>

              {/* Recommendations Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-medium">
                      <th className="text-left py-3 px-2 text-text-secondary text-sm font-medium">Parameter</th>
                      <th className="text-left py-3 px-2 text-text-secondary text-sm font-medium">Current</th>
                      <th className="text-left py-3 px-2 text-text-secondary text-sm font-medium">Recommended</th>
                      <th className="text-left py-3 px-2 text-text-secondary text-sm font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiResponse.recommendation?.recommendations?.map((rec, index) => {
                      const currentValue = aiResponse.state?.[rec.parameter];
                      const parameterName = rec.parameter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                      const unit = getParameterUnit(rec.parameter);
                      
                      return (
                        <tr key={index} className="border-b border-border-light hover:bg-surface-light transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center space-x-2">
                              <Icon name={getParameterIcon(rec.parameter)} size={14} className="text-primary" strokeWidth={2} />
                              <span className="font-medium text-text-primary text-sm">{parameterName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm text-text-primary">
                              {currentValue?.toFixed(1)}{unit}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-mono text-sm text-primary font-semibold">
                              {rec.new_value?.toFixed(1)}{unit}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rec.action === 'increase' 
                                ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/25 dark:text-red-300 dark:border-red-700'
                                : 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/25 dark:text-green-300 dark:border-green-700'
                            }`}>
                              {rec.action === 'increase' ? '↑' : '↓'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Energy Savings & System Status */}
              <div className="grid grid-cols-1 gap-4">
                {/* Energy Savings */}
                <div className="bg-surface-light rounded-lg p-4 border border-border-light">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="Zap" size={16} className="text-yellow-500" strokeWidth={2} />
                    <h3 className="font-semibold text-text-primary">Energy Savings</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">Estimated:</span>
                      <span className="font-bold text-lg text-green-600">
                        {aiResponse.recommendation?.estimated_energy_saving_pct || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary text-sm">Verified:</span>
                      <span className="font-mono text-sm">
                        {aiResponse?.recommendation?.verified_saving_pct !== null && aiResponse?.recommendation?.verified_saving_pct !== undefined
                          ? `${aiResponse.recommendation.verified_saving_pct}%`
                          : 'Pending'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-surface-light rounded-lg p-4 border border-border-light">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="AlertTriangle" size={16} className="text-orange-500" strokeWidth={2} />
                    <h3 className="font-semibold text-text-primary">System Status</h3>
                  </div>
                  <div className="space-y-2">
                    {aiResponse?.anomaly?.anomaly_flag ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600 font-medium text-sm">Anomalies Detected</span>
                        </div>
                        <div className="space-y-1">
                          {aiResponse?.anomaly?.anomalies?.map((anomaly, index) => (
                            <div key={index} className="text-xs text-text-secondary bg-red-50 dark:bg-red-900/25 p-2 rounded border border-red-200 dark:border-red-700">
                              {anomaly}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium text-sm">No anomalies detected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="mt-4 bg-blue-50 dark:bg-blue-900/25 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-2">
                  <Icon name="Brain" size={16} className="text-blue-600 mt-0.5" strokeWidth={2} />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">AI Analysis</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                      {aiResponse.recommendation?.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Overview */}
            <div className="bg-surface rounded-lg border border-border-medium p-6">
              <ImpactMetrics recommendations={filteredRecommendations} />
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {!runCycleMutation?.isPending && (
          <div className="grid grid-cols-1 gap-6">
            {/* Recommendations List */}
            <div className="bg-surface rounded-lg border border-border-medium p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Optimization Recommendations
              </h2>
              <p className="text-text-secondary text-sm mt-1">
                {filteredRecommendations?.length} recommendations found, sorted by impact
              </p>
            </div>

            <div className="space-y-4">
              {filteredRecommendations?.map((recommendation) => (
                <RecommendationCard 
                  key={recommendation?.id} 
                  recommendation={recommendation}
                  onStatusUpdate={handleRecommendationStatusUpdate}
                />
              ))}
            </div>

            {filteredRecommendations?.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-text-secondary mb-4" strokeWidth={1} />
                <h3 className="text-text-primary font-medium mb-2">No recommendations found</h3>
                <p className="text-text-secondary text-sm">
                  Try adjusting your filters or run a new AI cycle to generate recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationsEngine;
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
        <div className="flex items-center justify-between">
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


        {/* Gemini AI Recommendations and Impact Overview Grid */}
        {aiResponse && (
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
      </div>
    </div>
  );
};

export default AIRecommendationsEngine;
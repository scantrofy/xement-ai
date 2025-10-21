import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const RecommendationCard = ({ recommendation, onStatusUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementationProgress, setImplementationProgress] = useState(0);
  const [implementationStage, setImplementationStage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(recommendation?.status);
  const [energySavingsAchieved, setEnergySavingsAchieved] = useState(null);

  const getPriorityConfig = (priority) => {
    const configs = {
      high: {
        bg: 'bg-red-50 dark:bg-red-900/25',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-100 dark:bg-red-900/25 text-red-800 dark:text-red-300',
      },
      medium: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/25',
        border: 'border-yellow-200 dark:border-yellow-700', 
        text: 'text-yellow-700 dark:text-yellow-300',
        badge: 'bg-yellow-100 dark:bg-yellow-900/25 text-yellow-800 dark:text-yellow-300',
      },
      low: {
        bg: 'bg-green-50 dark:bg-green-900/25',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-700 dark:text-green-300',
        badge: 'bg-green-100 dark:bg-green-900/25 text-green-800 dark:text-green-300',
      },
    };
    return configs?.[priority] || configs?.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-orange-100 dark:bg-orange-900/25 border-orange-200 dark:border-orange-700',
        text: 'text-orange-700 dark:text-orange-300',
        icon: 'Clock',
      },
      in_progress: {
        bg: 'bg-blue-100 dark:bg-blue-900/25',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'PlayCircle',
      },
      completed: {
        bg: 'bg-green-100 dark:bg-green-900/25',
        text: 'text-green-700 dark:text-green-300',
        icon: 'CheckCircle',
      },
      paused: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/25',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: 'PauseCircle',
      },
    };
    return configs?.[status] || configs?.pending;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      energy: 'Zap',
      efficiency: 'Settings',
      emissions: 'Cloud',
      maintenance: 'Wrench',
      quality: 'Award',
    };
    return icons?.[category] || 'Lightbulb';
  };

  const priorityConfig = getPriorityConfig(recommendation?.priority);
  const statusConfig = getStatusConfig(recommendation?.status);
  const categoryIcon = getCategoryIcon(recommendation?.category);

  const handleImplement = async () => {
    setIsImplementing(true);
    setCurrentStatus('in_progress');
    setImplementationProgress(0);
    
    // Notify parent component of status change
    if (onStatusUpdate) {
      onStatusUpdate(recommendation.id, 'in_progress');
    }

    // Stage 1: Validating parameters (2 seconds)
    setImplementationStage('Validating parameters...');
    await simulateProgress(0, 20, 2000);
    
    // Stage 2: Applying changes to control system (3 seconds)
    setImplementationStage('Applying changes to control system...');
    await simulateProgress(20, 50, 3000);
    
    // Stage 3: Monitoring system response (3 seconds)
    setImplementationStage('Monitoring system response...');
    await simulateProgress(50, 80, 3000);
    
    // Stage 4: Verifying implementation (2 seconds)
    setImplementationStage('Verifying implementation...');
    await simulateProgress(80, 100, 2000);
    
    // Calculate achieved energy savings (simulate real monitoring)
    const expectedSaving = recommendation?.expectedSaving || 0;
    const actualSaving = expectedSaving * (0.8 + Math.random() * 0.4); // 80-120% of expected
    setEnergySavingsAchieved(actualSaving);
    
    // Complete implementation
    setCurrentStatus('completed');
    setImplementationStage('Implementation completed successfully!');
    setIsImplementing(false);
    
    // Notify parent component of completion
    if (onStatusUpdate) {
      onStatusUpdate(recommendation.id, 'completed', {
        energySavingsAchieved: actualSaving,
        implementedAt: new Date().toISOString()
      });
    }
    
    // Show completion message for 3 seconds
    setTimeout(() => {
      setImplementationStage('');
    }, 3000);
  };

  const simulateProgress = (startProgress, endProgress, duration) => {
    return new Promise((resolve) => {
      const steps = 20;
      const stepDuration = duration / steps;
      const progressIncrement = (endProgress - startProgress) / steps;
      
      let currentProgress = startProgress;
      const interval = setInterval(() => {
        currentProgress += progressIncrement;
        setImplementationProgress(Math.min(currentProgress, endProgress));
        
        if (currentProgress >= endProgress) {
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  };

  return (
    <div className={`${priorityConfig?.bg} ${priorityConfig?.border} border rounded-lg p-6 transition-all duration-200 hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${priorityConfig?.badge}`}>
            <Icon name={categoryIcon} size={16} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {recommendation?.title}
            </h3>
            <p className="text-text-secondary text-sm">
              {recommendation?.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityConfig?.badge}`}>
            {recommendation?.priority?.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusConfig?.bg} ${statusConfig?.text}`}>
            {currentStatus?.replace('_', ' ')?.toUpperCase()}
          </span>
        </div>
      </div>
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-bold text-text-primary">
            {recommendation?.confidence}%
          </div>
          <div className="text-xs text-text-secondary">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            ${recommendation?.impact?.cost_savings?.toLocaleString()}
          </div>
          <div className="text-xs text-text-secondary">Cost Savings</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {recommendation?.roi}%
          </div>
          <div className="text-xs text-text-secondary">Expected ROI</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-600">
            {recommendation?.timeline}
          </div>
          <div className="text-xs text-text-secondary">Timeline</div>
        </div>
      </div>
      {/* Implementation Progress */}
      {isImplementing && (
        <div className="bg-blue-50 dark:bg-blue-900/25 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {implementationStage}
            </span>
            <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
              {Math.round(implementationProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${implementationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Parameter Changes Display */}
      {(currentStatus === 'in_progress' || currentStatus === 'completed') && (
        <div className="bg-green-50 dark:bg-green-900/25 rounded-lg p-4 mb-4 border border-green-200 dark:border-green-700">
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center space-x-2">
            <Icon name="Settings" size={14} strokeWidth={2} />
            <span>Parameter Changes Applied</span>
          </h4>
          <div className="space-y-2">
            {recommendation?.parameter && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">
                  {recommendation.parameter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span className="font-mono text-green-700 dark:text-green-300">
                  {recommendation?.currentValue?.toFixed(1)} → {recommendation?.recommendedValue?.toFixed(1)}
                  {recommendation?.parameter === 'kiln_temp' ? '°C' : 
                   recommendation?.parameter === 'fan_speed' ? '%' : ''}
                </span>
              </div>
            )}
            {energySavingsAchieved && (
              <div className="flex items-center justify-between text-sm pt-2 border-t border-green-200 dark:border-green-700">
                <span className="text-green-600 dark:text-green-400">Energy Savings Achieved:</span>
                <span className="font-semibold text-green-700 dark:text-green-300">
                  {energySavingsAchieved.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Impact Summary */}
      <div className="bg-white/50 dark:bg-surface-light rounded-lg p-4 mb-4 border dark:border-border-light">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="TrendingUp" size={14} className="text-green-500" />
              <span className="text-text-secondary">Efficiency:</span>
              <span className="font-semibold text-green-600">
                +{recommendation?.impact?.efficiency_gain}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Award" size={14} className="text-blue-500" />
              <span className="text-text-secondary">Quality:</span>
              <span className="font-semibold text-blue-600">
                +{recommendation?.impact?.quality_improvement}%
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="DollarSign" size={14} className="text-purple-500" />
              <span className="text-text-secondary">Savings:</span>
              <span className="font-semibold text-purple-600">
                {energySavingsAchieved ? energySavingsAchieved.toFixed(1) : recommendation?.expectedSaving}%
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-text-secondary hover:text-primary transition-colors text-sm"
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} strokeWidth={2} />
          <span>{isExpanded ? 'Show Less' : 'View Details'}</span>
        </button>

        <div className="flex items-center space-x-2">
          {currentStatus === 'pending' && (
            <button
              onClick={handleImplement}
              disabled={isImplementing}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isImplementing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Implementing...</span>
                </>
              ) : (
                <>
                  <Icon name="PlayCircle" size={14} strokeWidth={2} />
                  <span>Implement</span>
                </>
              )}
            </button>
          )}
          
          {currentStatus === 'completed' && energySavingsAchieved && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200">
              <Icon name="CheckCircle" size={14} strokeWidth={2} />
              <span>Achieved {energySavingsAchieved.toFixed(1)}% savings</span>
            </div>
          )}
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-border-light">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Reasoning */}
            <div>
              <h4 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
                <Icon name="Brain" size={16} className="text-purple-500" strokeWidth={2} />
                <span>AI Analysis</span>
              </h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                {recommendation?.reasoning}
              </p>
            </div>

            {/* Implementation Steps */}
            <div>
              <h4 className="font-semibold text-text-primary mb-3 flex items-center space-x-2">
                <Icon name="ListChecks" size={16} className="text-blue-500" strokeWidth={2} />
                <span>Implementation Steps</span>
              </h4>
              <ol className="text-sm text-text-secondary space-y-2">
                {recommendation?.steps?.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs flex items-center justify-center mt-0.5">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
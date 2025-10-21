import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CycleRunPanel = ({ runCycleMutation, onRunCycle }) => {
  const [runHistory] = useState([
    {
      id: 1,
      timestamp: '2024-01-19 14:30:15',
      status: 'completed',
      recommendations: 4,
      processingTime: '2.3s',
      improvements: {
        efficiency: 12.5,
        cost_savings: 18750,
        quality: 3.2,
      },
    },
    {
      id: 2,
      timestamp: '2024-01-19 11:15:42',
      status: 'completed',
      recommendations: 3,
      processingTime: '1.8s',
      improvements: {
        efficiency: 8.7,
        cost_savings: 12300,
        quality: 2.1,
      },
    },
    {
      id: 3,
      timestamp: '2024-01-19 08:45:22',
      status: 'completed',
      recommendations: 5,
      processingTime: '2.7s',
      improvements: {
        efficiency: 15.3,
        cost_savings: 24500,
        quality: 4.8,
      },
    },
    {
      id: 4,
      timestamp: '2024-01-18 16:20:08',
      status: 'failed',
      recommendations: 0,
      processingTime: 'timeout',
      error: 'Data connection timeout',
    },
  ]);

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        bg: 'bg-green-100 dark:bg-green-900/25',
        text: 'text-green-700 dark:text-green-300',
        icon: 'CheckCircle',
      },
      running: {
        bg: 'bg-blue-100 dark:bg-blue-900/25',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'PlayCircle',
      },
      failed: {
        bg: 'bg-red-100 dark:bg-red-900/25',
        text: 'text-red-700 dark:text-red-300',
        icon: 'XCircle',
      },
    };
    return configs?.[status] || configs?.completed;
  };

  return (
    <div className="space-y-6">
      {/* Cycle Run Control */}
      <div className="bg-surface rounded-lg border border-border-medium p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">AI Cycle Control</h2>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="text-center">
            <button
              onClick={onRunCycle}
              disabled={runCycleMutation?.isPending}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 font-medium"
            >
              {runCycleMutation?.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Running Analysis...</span>
                </>
              ) : (
                <>
                  <Icon name="Play" size={18} strokeWidth={2} />
                  <span>Run AI Cycle</span>
                </>
              )}
            </button>
          </div>

          {/* Cycle Info */}
          <div className="bg-blue-50 dark:bg-blue-900/25 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-blue-500 dark:text-blue-300 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Cycle Process:</p>
                <ul className="text-xs space-y-1">
                  <li>• Fetches latest plant state</li>
                  <li>• Runs anomaly detection</li>
                  <li>• Generates AI recommendations</li>
                  <li>• Updates Firestore database</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Automated Schedule */}
          <div className="border border-border-medium rounded-lg p-4">
            <h3 className="font-medium text-text-primary mb-3 flex items-center space-x-2">
              <Icon name="Clock" size={16} strokeWidth={2} />
              <span>Automated Schedule</span>
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Next Run:</span>
                <span className="text-text-primary font-mono">15:30 (30 min)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Interval:</span>
                <span className="text-text-primary font-mono">Every 2 hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Performance Analytics */}
      <div className="bg-surface rounded-lg border border-border-medium p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Performance Analytics</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">12.1%</div>
            <div className="text-xs text-text-secondary">Avg Efficiency Gain</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">$18.5K</div>
            <div className="text-xs text-text-secondary">Avg Cost Savings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">3.4%</div>
            <div className="text-xs text-text-secondary">Quality Improvement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">98.7%</div>
            <div className="text-xs text-text-secondary">Success Rate</div>
          </div>
        </div>

        {/* Historical Results */}
        <div className="space-y-3">
          <h3 className="font-medium text-text-primary text-sm">Recent Runs</h3>
          {runHistory?.slice(0, 3)?.map((run) => {
            const statusConfig = getStatusConfig(run?.status);
            
            return (
              <div key={run?.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border-light">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={statusConfig?.icon} 
                    size={16} 
                    className={statusConfig?.text}
                    strokeWidth={2}
                  />
                  <div>
                    <div className="text-xs text-text-secondary font-mono">
                      {new Date(run.timestamp)?.toLocaleTimeString()}
                    </div>
                    {run?.status === 'completed' && (
                      <div className="text-xs text-text-primary font-semibold">
                        {run?.recommendations} recommendations
                      </div>
                    )}
                    {run?.status === 'failed' && (
                      <div className="text-xs text-red-600">
                        {run?.error}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {run?.status === 'completed' && (
                    <>
                      <div className="text-xs font-semibold text-green-600">
                        ${run?.improvements?.cost_savings?.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {run?.processingTime}
                      </div>
                    </>
                  )}
                  {run?.status === 'failed' && (
                    <span className={`px-2 py-0.5 text-xs rounded ${statusConfig?.bg} ${statusConfig?.text}`}>
                      Failed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CycleRunPanel;
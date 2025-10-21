import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const WorkflowFunnel = ({ pullRequests, onPRSelect }) => {
  const [selectedStage, setSelectedStage] = useState(null);

  // Calculate workflow stages
  const calculateWorkflowStages = () => {
    const stages = [
      {
        id: 'draft',
        name: 'Draft',
        description: 'PRs in draft state',
        icon: 'Edit3',
        color: 'text-text-secondary',
        bgColor: 'bg-surface-light',
        count: Math.floor(pullRequests?.length * 0.15),
        percentage: 15
      },
      {
        id: 'ready-for-review',
        name: 'Ready for Review',
        description: 'PRs waiting for initial review',
        icon: 'Eye',
        color: 'text-warning',
        bgColor: 'bg-warning/10',
        count: Math.floor(pullRequests?.length * 0.25),
        percentage: 25
      },
      {
        id: 'in-review',
        name: 'In Review',
        description: 'PRs currently being reviewed',
        icon: 'MessageSquare',
        color: 'text-secondary',
        bgColor: 'bg-secondary/10',
        count: Math.floor(pullRequests?.length * 0.30),
        percentage: 30
      },
      {
        id: 'changes-requested',
        name: 'Changes Requested',
        description: 'PRs requiring modifications',
        icon: 'AlertCircle',
        color: 'text-error',
        bgColor: 'bg-error/10',
        count: Math.floor(pullRequests?.length * 0.15),
        percentage: 15
      },
      {
        id: 'approved',
        name: 'Approved',
        description: 'PRs approved and ready to merge',
        icon: 'CheckCircle',
        color: 'text-success',
        bgColor: 'bg-success/10',
        count: Math.floor(pullRequests?.length * 0.10),
        percentage: 10
      },
      {
        id: 'merged',
        name: 'Merged',
        description: 'Successfully merged PRs',
        icon: 'GitMerge',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        count: Math.floor(pullRequests?.length * 0.05),
        percentage: 5
      }
    ];

    return stages;
  };

  const workflowStages = calculateWorkflowStages();
  const totalPRs = workflowStages?.reduce((sum, stage) => sum + stage?.count, 0);

  const handleStageClick = (stage) => {
    setSelectedStage(selectedStage?.id === stage?.id ? null : stage);
    
    // Simulate finding PRs in this stage
    if (pullRequests?.length > 0) {
      const mockPR = pullRequests?.[Math.floor(Math.random() * pullRequests?.length)];
      onPRSelect(mockPR);
    }
  };

  const getStageWidth = (count) => {
    return Math.max((count / totalPRs) * 100, 8); // Minimum 8% width for visibility
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            PR Workflow Funnel
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Status transitions and bottleneck analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-1 text-text-secondary hover:text-text-primary transition-smooth">
            <Icon name="Filter" size={14} strokeWidth={2} />
            <span className="text-sm font-mono">Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1 text-text-secondary hover:text-text-primary transition-smooth">
            <Icon name="Download" size={14} strokeWidth={2} />
            <span className="text-sm font-mono">Export</span>
          </button>
        </div>
      </div>
      {/* Funnel Visualization */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {workflowStages?.map((stage, index) => {
          const isSelected = selectedStage?.id === stage?.id;
          const stageWidth = getStageWidth(stage?.count);
          
          return (
            <div key={stage?.id} className="relative">
              {/* Stage Bar */}
              <button
                onClick={() => handleStageClick(stage)}
                className={`w-full text-left transition-all duration-300 rounded-lg border-2 ${
                  isSelected 
                    ? 'border-primary shadow-elevated transform scale-[1.02]' 
                    : 'border-border-medium hover:border-border-light hover:shadow-subtle'
                }`}
              >
                <div 
                  className={`${stage?.bgColor} rounded-lg p-4 transition-all duration-300 min-h-[80px] flex items-center`}
                  style={{ width: `${stageWidth}%`, minWidth: '200px' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${stage?.bgColor} rounded-lg flex items-center justify-center border border-border-medium`}>
                        <Icon 
                          name={stage?.icon} 
                          size={20} 
                          className={stage?.color}
                          strokeWidth={2}
                        />
                      </div>
                      
                      <div>
                        <h4 className={`font-medium font-mono ${stage?.color}`}>
                          {stage?.name}
                        </h4>
                        <p className="text-xs text-text-secondary font-mono mt-1">
                          {stage?.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-xl font-bold font-mono ${stage?.color}`}>
                        {stage?.count}
                      </div>
                      <div className="text-xs text-text-secondary font-mono">
                        {stage?.percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              {/* Connection Arrow */}
              {index < workflowStages?.length - 1 && (
                <div className="flex justify-center my-2">
                  <Icon 
                    name="ChevronDown" 
                    size={16} 
                    className="text-text-secondary"
                    strokeWidth={2}
                  />
                </div>
              )}
              {/* Bottleneck Indicator */}
              {stage?.percentage > 25 && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-error rounded-full flex items-center justify-center">
                    <Icon name="AlertTriangle" size={12} color="white" strokeWidth={2} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Stage Details */}
      {selectedStage && (
        <div className="mt-6 p-4 bg-background rounded-lg border border-border-medium">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-medium font-mono ${selectedStage?.color}`}>
              {selectedStage?.name} Details
            </h4>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-text-secondary hover:text-text-primary transition-smooth"
            >
              <Icon name="X" size={16} strokeWidth={2} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary font-mono">
                {selectedStage?.count}
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Total PRs
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary font-mono">
                {(Math.random() * 3 + 1)?.toFixed(1)}d
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Avg Time in Stage
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary font-mono">
                {Math.floor(Math.random() * 5 + 1)}
              </div>
              <div className="text-xs text-text-secondary font-mono">
                Bottleneck Score
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="w-full py-2 text-sm font-mono text-primary hover:text-primary-600 transition-smooth border border-primary/20 rounded-lg hover:bg-primary/5">
              View PRs in {selectedStage?.name}
            </button>
          </div>
        </div>
      )}
      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-border-medium">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-text-primary font-mono">
              {totalPRs}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Total PRs
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-warning font-mono">
              {workflowStages?.find(s => s?.id === 'changes-requested')?.count || 0}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Need Changes
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-success font-mono">
              {workflowStages?.find(s => s?.id === 'approved')?.count || 0}
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Ready to Merge
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-primary font-mono">
              {((workflowStages?.find(s => s?.id === 'merged')?.count || 0) / totalPRs * 100)?.toFixed(1)}%
            </div>
            <div className="text-xs text-text-secondary font-mono">
              Merge Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowFunnel;
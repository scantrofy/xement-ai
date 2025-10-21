import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CorrelationMatrix = ({ data }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);

  const metrics = ['Commits', 'PR Size', 'Review Time', 'Cycle Time'];
  
  // Create correlation matrix from data
  const createMatrix = () => {
    const matrix = {};
    metrics?.forEach(metric1 => {
      matrix[metric1] = {};
      metrics?.forEach(metric2 => {
        if (metric1 === metric2) {
          matrix[metric1][metric2] = 1.0;
        } else {
          const correlation = data?.find(d => 
            (d?.metric1 === metric1 && d?.metric2 === metric2) ||
            (d?.metric1 === metric2 && d?.metric2 === metric1)
          );
          matrix[metric1][metric2] = correlation ? correlation?.correlation : 0;
        }
      });
    });
    return matrix;
  };

  const matrix = createMatrix();

  const getCorrelationColor = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return value > 0 ? 'bg-success' : 'bg-error';
    if (absValue >= 0.6) return value > 0 ? 'bg-success/70' : 'bg-error/70';
    if (absValue >= 0.4) return value > 0 ? 'bg-success/50' : 'bg-error/50';
    if (absValue >= 0.2) return value > 0 ? 'bg-success/30' : 'bg-error/30';
    return 'bg-surface-light';
  };

  const getCorrelationIntensity = (value) => {
    const absValue = Math.abs(value);
    return Math.min(absValue, 1) * 100;
  };

  const getCorrelationStrength = (value) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'Very Strong';
    if (absValue >= 0.6) return 'Strong';
    if (absValue >= 0.4) return 'Moderate';
    if (absValue >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const handleCellClick = (metric1, metric2, value) => {
    if (metric1 !== metric2) {
      setSelectedCell({ metric1, metric2, value });
    }
  };

  const handleCellHover = (metric1, metric2, value) => {
    if (metric1 !== metric2) {
      setHoverCell({ metric1, metric2, value });
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-mono">
            Correlation Matrix
          </h3>
          <p className="text-text-secondary font-mono text-sm mt-1">
            Relationships between productivity metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Info" size={16} strokeWidth={2} />
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Download" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Matrix */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-1">
          {/* Empty top-left cell */}
          <div className="h-12"></div>
          
          {/* Column headers */}
          {metrics?.map((metric) => (
            <div
              key={`header-${metric}`}
              className="h-12 flex items-center justify-center bg-background rounded-lg border border-border-medium"
            >
              <span className="text-xs font-medium text-text-primary font-mono text-center px-2">
                {metric}
              </span>
            </div>
          ))}

          {/* Matrix rows */}
          {metrics?.map((rowMetric) => (
            <React.Fragment key={`row-${rowMetric}`}>
              {/* Row header */}
              <div className="h-12 flex items-center justify-center bg-background rounded-lg border border-border-medium">
                <span className="text-xs font-medium text-text-primary font-mono text-center px-2">
                  {rowMetric}
                </span>
              </div>
              
              {/* Matrix cells */}
              {metrics?.map((colMetric) => {
                const value = matrix?.[rowMetric]?.[colMetric];
                const isSelected = selectedCell && 
                  ((selectedCell?.metric1 === rowMetric && selectedCell?.metric2 === colMetric) ||
                   (selectedCell?.metric1 === colMetric && selectedCell?.metric2 === rowMetric));
                const isHovered = hoverCell && 
                  ((hoverCell?.metric1 === rowMetric && hoverCell?.metric2 === colMetric) ||
                   (hoverCell?.metric1 === colMetric && hoverCell?.metric2 === rowMetric));

                return (
                  <div
                    key={`cell-${rowMetric}-${colMetric}`}
                    className={`h-12 flex items-center justify-center rounded-lg border cursor-pointer transition-smooth ${
                      rowMetric === colMetric 
                        ? 'bg-primary/20 border-primary/30' 
                        : `${getCorrelationColor(value)} border-border-medium hover:border-border-medium hover:scale-105`
                    } ${isSelected ? 'ring-2 ring-primary' : ''} ${isHovered ? 'scale-105' : ''}`}
                    onClick={() => handleCellClick(rowMetric, colMetric, value)}
                    onMouseEnter={() => handleCellHover(rowMetric, colMetric, value)}
                    onMouseLeave={() => setHoverCell(null)}
                  >
                    <span className={`text-xs font-bold font-mono ${
                      rowMetric === colMetric ? 'text-primary' : 'text-text-primary'
                    }`}>
                      {value?.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-text-secondary font-mono">
            Correlation Strength
          </span>
          <div className="flex items-center space-x-4 text-xs text-text-secondary font-mono">
            <span>-1.0</span>
            <span>0.0</span>
            <span>+1.0</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 h-4 bg-gradient-to-r from-error via-surface-light to-success rounded-lg"></div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-text-secondary font-mono">
          <span>Strong Negative</span>
          <span>No Correlation</span>
          <span>Strong Positive</span>
        </div>
      </div>
      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="bg-background rounded-lg border border-border-medium p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary font-mono">
              Correlation Analysis
            </h4>
            <button
              onClick={() => setSelectedCell(null)}
              className="p-1 text-text-secondary hover:text-text-primary transition-smooth"
            >
              <Icon name="X" size={14} strokeWidth={2} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-text-secondary font-mono">Metrics</span>
              <p className="text-sm text-text-primary font-mono font-medium">
                {selectedCell?.metric1} ↔ {selectedCell?.metric2}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">Correlation</span>
              <p className={`text-sm font-mono font-bold ${
                selectedCell?.value > 0 ? 'text-success' : selectedCell?.value < 0 ? 'text-error' : 'text-text-secondary'
              }`}>
                {selectedCell?.value?.toFixed(3)} ({getCorrelationStrength(selectedCell?.value)})
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border-medium">
            <p className="text-xs text-text-secondary font-mono">
              {selectedCell?.value > 0.6 
                ? `Strong positive correlation suggests these metrics tend to increase together.`
                : selectedCell?.value < -0.6
                ? `Strong negative correlation suggests these metrics tend to move in opposite directions.`
                : `Moderate correlation indicates some relationship but other factors may be involved.`
              }
            </p>
          </div>
        </div>
      )}
      {/* Insights */}
      <div className="bg-background rounded-lg border border-border-medium p-4">
        <h4 className="text-sm font-semibold text-text-primary font-mono mb-3">
          Key Insights
        </h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Icon name="TrendingUp" size={14} className="text-success mt-0.5" strokeWidth={2} />
            <p className="text-xs text-text-secondary font-mono">
              PR Size and Review Time show strong positive correlation (0.84) - larger PRs take longer to review
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-warning mt-0.5" strokeWidth={2} />
            <p className="text-xs text-text-secondary font-mono">
              Commits and Review Time have negative correlation (-0.45) - frequent commits may reduce review complexity
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Target" size={14} className="text-primary mt-0.5" strokeWidth={2} />
            <p className="text-xs text-text-secondary font-mono">
              PR Size and Cycle Time are highly correlated (0.91) - consider breaking down large PRs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationMatrix;
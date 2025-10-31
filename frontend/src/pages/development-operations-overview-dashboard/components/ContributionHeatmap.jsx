import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ContributionHeatmap = ({ onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date?.setDate(date?.getDate() - i);
      
      const dayOfWeek = date?.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseIntensity = isWeekend ? 0.2 : 0.8;
      const randomFactor = Math.random();
      const intensity = Math.floor(baseIntensity * randomFactor * 5);
      
      data?.push({
        date: date?.toISOString()?.split('T')?.[0],
        intensity,
        commits: intensity * 3 + Math.floor(Math.random() * 5),
        contributors: intensity > 0 ? Math.floor(intensity / 2) + 1 : 0
      });
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();
  
  const groupByWeeks = (data) => {
    const weeks = [];
    let currentWeek = [];
    
    data?.forEach((day, index) => {
      const date = new Date(day.date);
      const dayOfWeek = date?.getDay();
      
      if (index === 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek?.push(null);
        }
      }
      
      currentWeek?.push(day);
      
      if (dayOfWeek === 6 || index === data?.length - 1) {
        while (currentWeek?.length < 7) {
          currentWeek?.push(null);
        }
        weeks?.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return weeks;
  };

  const weeks = groupByWeeks(heatmapData);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getIntensityColor = (intensity) => {
    const colors = [
      'bg-surface-light', // 0 - no activity
      'bg-primary/20',    // 1 - low activity
      'bg-primary/40',    // 2 - medium-low activity
      'bg-primary/60',    // 3 - medium activity
      'bg-primary/80',    // 4 - high activity
      'bg-primary'        // 5 - very high activity
    ];
    return colors?.[intensity] || colors?.[0];
  };

  const handleDateClick = (day) => {
    if (!day) return;
    setSelectedDate(day?.date);
    onDateClick?.(day);
  };

  const handleDateHover = (day) => {
    setHoveredDate(day);
  };

  const getTooltipContent = (day) => {
    if (!day) return null;
    
    const date = new Date(day.date);
    const formattedDate = date?.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return {
      date: formattedDate,
      commits: day?.commits,
      contributors: day?.contributors,
      intensity: day?.intensity
    };
  };

  const getMonthHeaders = () => {
    const headers = [];
    let currentMonth = -1;
    
    weeks?.forEach((week, weekIndex) => {
      const firstDay = week?.find(day => day !== null);
      if (firstDay) {
        const date = new Date(firstDay.date);
        const month = date?.getMonth();
        
        if (month !== currentMonth) {
          headers?.push({
            month: monthLabels?.[month],
            weekIndex,
            width: 1
          });
          currentMonth = month;
        } else if (headers?.length > 0) {
          headers[headers.length - 1].width++;
        }
      }
    });
    
    return headers;
  };

  const monthHeaders = getMonthHeaders();

  return (
    <div className="bg-surface border border-border-medium rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-text-primary font-mono">
            Contribution Activity
          </h2>
          <p className="text-sm text-text-secondary font-mono mt-1">
            Daily commit patterns and team activity intensity
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Legend */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-text-secondary font-mono">Less</span>
            {[0, 1, 2, 3, 4, 5]?.map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
            <span className="text-xs text-text-secondary font-mono">More</span>
          </div>
          <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
            <Icon name="Download" size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
      {/* Heatmap Container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Month Headers */}
          <div className="flex mb-2 ml-8">
            {monthHeaders?.map((header, index) => (
              <div
                key={index}
                className="text-xs text-text-secondary font-mono"
                style={{ width: `${header?.width * 14}px` }}
              >
                {header?.month}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col mr-2">
              {dayLabels?.map((day, index) => (
                <div
                  key={day}
                  className={`h-3 flex items-center text-xs text-text-secondary font-mono ${
                    index % 2 === 1 ? '' : 'opacity-0'
                  }`}
                  style={{ marginBottom: '2px' }}
                >
                  {index % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* Heatmap Cells */}
            <div className="flex space-x-0.5">
              {weeks?.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col space-y-0.5">
                  {week?.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-smooth ${
                        day 
                          ? `${getIntensityColor(day?.intensity)} hover:ring-2 hover:ring-primary/50 ${
                              selectedDate === day?.date ? 'ring-2 ring-primary' : ''
                            }`
                          : 'bg-transparent'
                      }`}
                      onClick={() => handleDateClick(day)}
                      onMouseEnter={() => handleDateHover(day)}
                      onMouseLeave={() => setHoveredDate(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Tooltip */}
      {hoveredDate && (
        <div className="mt-4 p-4 bg-background border border-border-medium rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-text-secondary font-mono">Date</span>
              <p className="text-sm text-text-primary font-mono font-medium">
                {getTooltipContent(hoveredDate)?.date}
              </p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">Commits</span>
              <p className="text-sm text-text-primary font-mono font-medium">
                {hoveredDate?.commits} commits
              </p>
            </div>
            <div>
              <span className="text-xs text-text-secondary font-mono">Contributors</span>
              <p className="text-sm text-text-primary font-mono font-medium">
                {hoveredDate?.contributors} developers
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border-light">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {heatmapData?.reduce((sum, day) => sum + day?.commits, 0)}
            </div>
            <div className="text-xs text-text-secondary font-mono">Total Commits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {heatmapData?.filter(day => day?.commits > 0)?.length}
            </div>
            <div className="text-xs text-text-secondary font-mono">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {Math.round(heatmapData?.reduce((sum, day) => sum + day?.commits, 0) / 365 * 10) / 10}
            </div>
            <div className="text-xs text-text-secondary font-mono">Daily Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary font-mono">
              {Math.max(...heatmapData?.map(day => day?.commits))}
            </div>
            <div className="text-xs text-text-secondary font-mono">Best Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionHeatmap;
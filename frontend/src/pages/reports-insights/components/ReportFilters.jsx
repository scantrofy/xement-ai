import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const ReportFilters = ({ reportPeriod, setReportPeriod }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-text-secondary" />
        <label className="text-sm font-medium text-text-secondary">Report Period:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setReportPeriod('daily')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reportPeriod === 'daily'
                ? 'bg-primary text-white'
                : 'bg-background text-text-secondary hover:bg-surface border border-border'
            }`}
          >
            <Clock className="w-4 h-4" />
            Daily (24 Hours)
          </button>
          <button
            onClick={() => setReportPeriod('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              reportPeriod === 'weekly'
                ? 'bg-primary text-white'
                : 'bg-background text-text-secondary hover:bg-surface border border-border'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Weekly (7 Days)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;

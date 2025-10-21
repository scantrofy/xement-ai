import React, { useState, useEffect } from 'react';
import { useHistoryData } from '../../../api/hooks';
import Icon from '../../../components/AppIcon';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ProductionSummary = ({ data }) => {
  const [sortColumn, setSortColumn] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const { data: historyData, isLoading, error } = useHistoryData();

  // Transform history data for table display
  const transformedData = historyData ? historyData.map((record, index) => {
    const timestamp = new Date(record.timestamp);
    return {
      id: `record-${index}`,
      timestamp: record.timestamp,
      formatted_time: timestamp.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      grinding_efficiency: record.grinding_efficiency,
      kiln_temp: record.kiln_temp,
      energy_use: record.energy_use,
      product_quality: record.product_quality,
      production_volume: record.production_volume,
      emissions: record.emissions,
      fan_speed: record.fan_speed,
      raw_material_ratio: `${(record.raw1_frac * 100).toFixed(1)}/${(record.raw2_frac * 100).toFixed(1)}`,
      quality_grade: record.quality_grade || (record.quality_label >= 2 ? 'A+' : record.quality_label >= 1 ? 'A' : 'B'),
    };
  }) : [];

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Historical Production Data Report', 14, 20);
    
    // Add subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Last 50 production states with detailed performance metrics', 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);
    
    // Prepare table data
    const tableHeaders = [
      'Timestamp',
      'Grinding Eff (%)',
      'Kiln Temp (°C)',
      'Energy (kWh/ton)',
      'Quality (%)',
      'CO₂ (kg/ton)',
      'Volume (tons/hr)',
      'Grade'
    ];
    
    const tableData = sortedData?.map(record => [
      record?.formatted_time || 'N/A',
      record?.grinding_efficiency?.toFixed(1) + '%' || 'N/A',
      record?.kiln_temp?.toFixed(0) + '°C' || 'N/A',
      record?.energy_use?.toFixed(1) || 'N/A',
      record?.product_quality?.toFixed(1) + '%' || 'N/A',
      record?.emissions?.toFixed(0) || 'N/A',
      record?.production_volume?.toFixed(1) || 'N/A',
      record?.quality_grade || 'N/A'
    ]) || [];
    
    // Add table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Light gray
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Timestamp
        1: { cellWidth: 20 }, // Grinding Eff
        2: { cellWidth: 20 }, // Kiln Temp
        3: { cellWidth: 25 }, // Energy
        4: { cellWidth: 18 }, // Quality
        5: { cellWidth: 20 }, // CO2
        6: { cellWidth: 25 }, // Volume
        7: { cellWidth: 15 }  // Grade
      },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: function (data) {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(
          'Page ' + data.pageNumber + ' of ' + pageCount,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    doc.save(`production-data-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getQualityGradeConfig = (grade) => {
    const configs = {
      'A+': {
        bg: 'bg-green-100 dark:bg-green-900/25',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-700',
      },
      'A': {
        bg: 'bg-blue-100 dark:bg-blue-900/25',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-700',
      },
      'B': {
        bg: 'bg-yellow-100 dark:bg-yellow-900/25',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-700',
      },
    };
    return configs?.[grade] || configs?.['A'];
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 1450 && temp <= 1480) return 'text-green-600';
    if (temp >= 1400 && temp <= 1500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const sortedData = transformedData?.length > 0 ? [...transformedData]?.sort((a, b) => {
    const aVal = a?.[sortColumn];
    const bVal = b?.[sortColumn];
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string') {
      return aVal?.localeCompare(bVal) * multiplier;
    }
    return (aVal - bVal) * multiplier;
  }) : [];

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border-medium p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-text-secondary">Loading historical data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-lg border border-border-medium p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading historical data: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Historical Production Data</h2>
          <p className="text-text-secondary text-sm mt-1">
            Last 50 production states with detailed performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleExportToPDF}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-text-secondary hover:text-primary border border-border-medium rounded hover:border-primary transition-colors"
          >
            <Icon name="Download" size={14} strokeWidth={2} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 bg-surface z-10">
              <tr className="border-b border-border-medium">
                <th className="text-left py-3 px-2 bg-surface w-32">
                  <button 
                    onClick={() => handleSort('timestamp')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Timestamp</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-28">
                  <button 
                    onClick={() => handleSort('grinding_efficiency')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Grinding Eff (%)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-28">
                  <button 
                    onClick={() => handleSort('kiln_temp')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Kiln Temp (°C)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-32">
                  <button 
                    onClick={() => handleSort('energy_use')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Energy (kWh/ton)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-24">
                  <button 
                    onClick={() => handleSort('product_quality')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Quality (%)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-28">
                  <button 
                    onClick={() => handleSort('emissions')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>CO₂ (kg/ton)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-32">
                  <button 
                    onClick={() => handleSort('production_volume')}
                    className="flex items-center space-x-1 text-text-secondary hover:text-text-primary text-sm font-medium"
                  >
                    <span>Volume (tons/hr)</span>
                    <Icon name="ArrowUpDown" size={12} strokeWidth={2} />
                  </button>
                </th>
                <th className="text-left py-3 px-2 bg-surface w-20">
                  <span className="text-text-secondary text-sm font-medium">Grade</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData?.map((record) => {
                const gradeConfig = getQualityGradeConfig(record?.quality_grade);
                
                return (
                  <tr key={record?.id} className="border-b border-border-light hover:bg-surface-light transition-colors">
                    <td className="py-3 px-2 w-32 truncate">
                      <span className="font-mono text-xs text-text-primary">
                        {record?.formatted_time}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-28">
                      <span className={`font-semibold text-sm ${getEfficiencyColor(record?.grinding_efficiency)}`}>
                        {record?.grinding_efficiency?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 w-28">
                      <span className={`font-mono text-sm ${getTemperatureColor(record?.kiln_temp)}`}>
                        {record?.kiln_temp?.toFixed(0)}°C
                      </span>
                    </td>
                    <td className="py-3 px-2 w-32">
                      <span className="text-text-primary font-mono text-sm">
                        {record?.energy_use?.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-24">
                      <span className="text-text-primary font-semibold text-sm">
                        {record?.product_quality?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-2 w-28">
                      <span className="text-text-primary font-mono text-sm">
                        {record?.emissions?.toFixed(0)}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-32">
                      <span className="text-text-primary font-mono text-sm">
                        {record?.production_volume?.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-20">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${gradeConfig?.bg} ${gradeConfig?.text} ${gradeConfig?.border}`}>
                        {record?.quality_grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Scrollable data indicator */}
        {sortedData?.length > 10 && (
          <div className="border-t border-border-light bg-surface-light p-3 text-center">
            <span className="text-text-secondary text-sm">
              {sortedData?.length} records available. First 10 rows visible - scroll within table to see more.
            </span>
          </div>
        )}
      </div>
      
      {/* Data Summary */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            Showing {sortedData?.length || 0} historical records
          </span>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-text-secondary">Optimal Performance</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-text-secondary">Warning Range</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-text-secondary">Critical Range</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSummary;
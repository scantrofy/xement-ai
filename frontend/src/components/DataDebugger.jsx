import React from 'react';
import { useLatestState } from '../api/hooks';

const DataDebugger = () => {
  const { data: plantData, isLoading, error } = useLatestState();

  if (isLoading) return <div className="p-4 bg-blue-50 rounded">Loading API data...</div>;
  if (error) return <div className="p-4 bg-red-50 rounded">Error: {error.message}</div>;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-bold mb-2">API Data Debug</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold text-blue-600">Raw API Response:</h4>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify(plantData, null, 2)}
          </pre>
        </div>
        <div>
          <h4 className="font-semibold text-green-600">Transformed Values:</h4>
          <ul className="bg-white p-2 rounded space-y-1">
            <li><strong>Energy Use:</strong> {plantData?.energy_use} kWh/ton</li>
            <li><strong>Grinding Efficiency:</strong> {plantData?.grinding_efficiency}%</li>
            <li><strong>Kiln Temp:</strong> {plantData?.kiln_temp}°C</li>
            <li><strong>Emissions:</strong> {plantData?.emissions} kg/ton</li>
            <li><strong>Product Quality:</strong> {plantData?.product_quality}%</li>
            <li><strong>Production Volume:</strong> {plantData?.production_volume} tons/hr</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataDebugger;

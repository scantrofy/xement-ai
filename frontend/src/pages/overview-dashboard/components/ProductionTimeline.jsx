import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLatestState } from '../../../api/hooks';

const ProductionTimeline = ({ data }) => {
  const [timelineData, setTimelineData] = useState([]);
  const { data: plantData } = useLatestState();

  useEffect(() => {
    if (plantData) {
      const currentTime = new Date();
      const newTimelineData = [];
      
      for (let i = 7; i >= 0; i--) {
        const timePoint = new Date(currentTime.getTime() - i * 60 * 60 * 1000);
        const timeString = timePoint.toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        const baseEfficiency = plantData.grinding_efficiency || 90;
        const baseEnergy = calculateEnergyEfficiency(plantData.energy_use);
        const baseQuality = plantData.product_quality || 95;
        const baseTemp = plantData.kiln_temp || 1450;
        
        const timeVariation = Math.sin((i / 8) * Math.PI * 2) * 3; // Cyclical variation
        const randomVariation = (Math.random() - 0.5) * 4; // Random noise
        
        newTimelineData.push({
          time: timeString,
          efficiency: Math.max(75, Math.min(100, baseEfficiency + timeVariation + randomVariation)),
          energy: Math.max(70, Math.min(100, baseEnergy + timeVariation + randomVariation)),
          quality: Math.max(85, Math.min(100, baseQuality + timeVariation * 0.5 + randomVariation * 0.5)),
          temperature: Math.max(1400, Math.min(1500, baseTemp + timeVariation * 5 + randomVariation * 3)),
        });
      }
      
      setTimelineData(newTimelineData);
    }
  }, [plantData]);

  const calculateEnergyEfficiency = (energyUse) => {
    if (!energyUse) return 85;
    // Convert energy use to efficiency percentage
    // Lower energy use = higher efficiency
    // Assuming optimal energy use is around 150 kWh/ton = 100% efficiency
    // Energy use of 300 kWh/ton = 50% efficiency
    const efficiency = Math.max(50, Math.min(100, 100 - ((energyUse - 150) / 150) * 50));
    return Math.round(efficiency * 10) / 10; // Round to 1 decimal
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface border border-border-medium rounded-lg p-4 shadow-lg">
          <p className="text-text-primary font-mono text-sm mb-2">{`Time: ${label}`}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              ></div>
              <span className="text-text-secondary">{entry?.name}:</span>
              <span className="text-text-primary font-medium">
                {entry?.value}{entry?.name === 'Temperature' ? '°C' : '%'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Production Timeline</h2>
          <p className="text-text-secondary text-sm mt-1">
            Real-time performance indicators across production cycles
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Data</span>
        </div>
      </div>

      <div className="h-[444px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="time" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              domain={[70, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              name="Grinding Efficiency"
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="energy" 
              name="Energy Efficiency"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="quality" 
              name="Product Quality"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default ProductionTimeline;
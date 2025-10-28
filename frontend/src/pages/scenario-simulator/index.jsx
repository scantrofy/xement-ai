import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useSimulateFuel } from '../../api/hooks';
import Icon from '../../components/AppIcon';
import { LoadingScreen } from '../../components/ui';

const ScenarioSimulator = () => {
  const [altFuelPercent, setAltFuelPercent] = useState(30);
  const [simulationData, setSimulationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const simulateFuelMutation = useSimulateFuel();

  useEffect(() => {
    // Load initial simulation data on component mount
    handleRunSimulation();
  }, []);

  // Auto-update simulation when slider changes
  useEffect(() => {
    if (simulationData) {
      // Debounce the simulation call
      const timeoutId = setTimeout(() => {
        handleRunSimulation();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [altFuelPercent]);

  const handleRunSimulation = async () => {
    setIsLoading(true);
    try {
      const result = await simulateFuelMutation?.mutateAsync({ 
        alt_fuel_percent: altFuelPercent 
      });
      setSimulationData(result);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    setAltFuelPercent(parseInt(e.target.value));
  };

  const currentSimulation = simulationData?.simulation || [];
  const currentPoint = currentSimulation?.find(point => point?.alt_fuel_pct === altFuelPercent) || 
                     currentSimulation?.[Math.floor(altFuelPercent / 10)] || 
                     { pred_energy_kwh_per_ton: 0, emissions_kgCO2_per_ton: 0 };

  // Show loading screen on initial load
  if (!simulationData && isLoading) {
    return (
      <LoadingScreen 
        message="Initializing simulation engine..."
        showLogo={true}
        fullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Scenario Simulator</h1>
          <p className="text-text-secondary">
            Model cement production scenarios and optimize fuel consumption patterns
          </p>
        </div>

        {/* Top Controls & Current Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Simulation Controls */}
          <div className="lg:col-span-2 bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="Settings" size={20} className="mr-2 text-primary" />
              Simulation Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Alternative Fuel Percentage: {altFuelPercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={altFuelPercent}
                  onChange={handleSliderChange}
                  className="w-full h-3 bg-surface-light rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(altFuelPercent/60)*100}%, #e5e7eb ${(altFuelPercent/60)*100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-text-tertiary mt-1">
                  <span>0%</span>
                  <span>30%</span>
                  <span>60%</span>
                </div>
                <div className="mt-2 text-xs text-text-secondary">
                  {isLoading ? 'Updating simulation...' : 'Drag to see real-time predictions'}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/25 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name="Info" size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Dynamic Simulation</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Chart updates automatically as you move the slider. No need to click run!
                </p>
              </div>
            </div>
          </div>

          {/* Current Prediction */}
          <div className="lg:col-span-2 bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <Icon name="Target" size={20} className="mr-2 text-success" />
              Current Prediction
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-primary-50 dark:bg-sky-900/25 rounded-lg">
                <span className="text-sm font-medium text-text-secondary">Energy Use</span>
                <span className="text-lg font-bold text-primary dark:text-sky-300">
                  {currentPoint?.pred_energy_kwh_per_ton || 108} kWh/ton
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-success-50 dark:bg-green-900/25 rounded-lg">
                <span className="text-sm font-medium text-text-secondary">CO₂ Emissions</span>
                <span className="text-lg font-bold text-success dark:text-green-300">
                  {currentPoint?.emissions_kgCO2_per_ton || 135} kg/ton
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-slate-900/25 rounded-lg">
                <span className="text-sm font-medium text-text-secondary">Alt Fuel %</span>
                <span className="text-lg font-bold text-secondary dark:text-slate-300">{altFuelPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Area */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Charts Area */}
          <div className="space-y-6">
            {/* Combined Dual-Axis Chart */}
            <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
                <Icon name="BarChart3" size={20} className="mr-2 text-primary" />
                Energy & Emissions vs Alternative Fuel Percentage
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={currentSimulation} margin={{ top: 20, right: 80, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis 
                      dataKey="alt_fuel_pct" 
                      stroke="#6b7280"
                      fontSize={12}
                      label={{ 
                        value: 'Alternative Fuel Percentage (%)', 
                        position: 'insideBottom', 
                        offset: -10,
                        style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' }
                      }}
                    />
                    {/* Left Y-axis for Energy */}
                    <YAxis 
                      yAxisId="energy"
                      stroke="#3b82f6"
                      fontSize={12}
                      label={{ 
                        value: 'Energy (kWh/ton)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '12px', fill: '#3b82f6' }
                      }}
                    />
                    {/* Right Y-axis for Emissions */}
                    <YAxis 
                      yAxisId="emissions"
                      orientation="right"
                      stroke="#10b981"
                      fontSize={12}
                      label={{ 
                        value: 'CO₂ Emissions (kg/ton)', 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle', fontSize: '12px', fill: '#10b981' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelFormatter={(value) => `Alternative Fuel: ${value}%`}
                      formatter={(value, name) => {
                        if (name === 'pred_energy_kwh_per_ton') {
                          return [`${value.toFixed(2)} kWh/ton`, 'Energy Consumption'];
                        }
                        if (name === 'emissions_kgCO2_per_ton') {
                          return [`${value.toFixed(2)} kg/ton`, 'CO₂ Emissions'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      iconType="line"
                      wrapperStyle={{ paddingBottom: '20px' }}
                    />
                    {/* Energy Line */}
                    <Line 
                      yAxisId="energy"
                      type="monotone" 
                      dataKey="pred_energy_kwh_per_ton" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
                      name="Energy Consumption"
                    />
                    {/* Emissions Line */}
                    <Line 
                      yAxisId="emissions"
                      type="monotone" 
                      dataKey="emissions_kgCO2_per_ton" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 3, fill: '#ffffff' }}
                      name="CO₂ Emissions"
                    />
                    {/* Current position indicator */}
                    {currentPoint && (
                      <Line 
                        yAxisId="energy"
                        type="monotone"
                        dataKey={() => null}
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Current Position Indicator */}
              {currentPoint && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/25 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Current Position: {altFuelPercent}% Alternative Fuel
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-blue-500 rounded"></div>
                        <span className="text-blue-600 font-medium">
                          {currentPoint.pred_energy_kwh_per_ton?.toFixed(2)} kWh/ton
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-1 bg-green-500 rounded"></div>
                        <span className="text-green-600 font-medium">
                          {currentPoint.emissions_kgCO2_per_ton?.toFixed(2)} kg/ton
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
            <Icon name="BarChart3" size={20} className="mr-2 text-accent" />
            Optimization Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success-50 dark:bg-green-900/25 rounded-lg">
              <div className="text-2xl font-bold text-success dark:text-green-300 mb-2">
                {currentSimulation?.length > 0 ? 
                  (Math.max(...currentSimulation?.map(d => d?.emissions_kgCO2_per_ton)) - 
                   Math.min(...currentSimulation?.map(d => d?.emissions_kgCO2_per_ton))).toFixed(1) : 
                  simulationData?.max_emission_reduction?.toFixed(1) || '0'}
              </div>
              <div className="text-sm text-text-secondary">Max CO₂ Reduction (kg/ton)</div>
            </div>
            <div className="text-center p-4 bg-primary-50 dark:bg-sky-900/25 rounded-lg">
              <div className="text-2xl font-bold text-primary dark:text-sky-300 mb-2">
                {currentSimulation?.find(d => d?.alt_fuel_pct === (simulationData?.optimal_fuel_pct || 30))?.pred_energy_kwh_per_ton?.toFixed(1) || 
                 simulationData?.max_energy_saving?.toFixed(1) || '0'}
              </div>
              <div className="text-sm text-text-secondary">Optimal Energy Point (kWh/ton)</div>
            </div>
            <div className="text-center p-4 bg-secondary-50 dark:bg-slate-900/25 rounded-lg">
              <div className="text-2xl font-bold text-secondary dark:text-slate-300 mb-2">{simulationData?.optimal_fuel_pct || 30}%</div>
              <div className="text-sm text-text-secondary">Recommended Alt Fuel %</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSimulator;
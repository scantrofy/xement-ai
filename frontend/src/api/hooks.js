import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const api = axios?.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL || 'https://YOUR-CLOUDRUN-URL.a.run.app',
  timeout: parseInt(import.meta.env?.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get Firebase auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Mock data for development and fallback
const mockPlantData = {
  energy_use: 85.4,
  grinding_efficiency: 92.3,
  kiln_temp: 1455,
  emissions: 820,
  product_quality: 96.8,
  production_volume: 142,
  timestamp: new Date()?.toISOString(),
  batch_id: 'BATCH-2025-001',
  shift: 'Day Shift A',
  operator: 'John Smith',
  status: 'operational',
  efficiency_score: 94.2,
  quality_grade: 'A+',
  maintenance_status: 'scheduled',
  fuel_consumption: 45.2,
  water_usage: 12.8,
  raw_material_inventory: 78.5,
};

const mockRecommendations = {
  recommendations: [
    {
      parameter: 'kiln_temp',
      current_value: 1455,
      recommended_value: 1465,
      reason: 'Optimize fuel efficiency and product quality',
      impact: 'Energy saving: 3.2%',
      priority: 'medium',
    },
    {
      parameter: 'grinding_speed',
      current_value: 145,
      recommended_value: 150,
      reason: 'Increase throughput while maintaining quality',
      impact: 'Production increase: 2.8%',
      priority: 'high',
    },
  ],
  verified_saving_pct: 4.1,
  anomalies: [],
  anomaly_flag: false,
  confidence_score: 0.87,
  execution_time: '2.3s',
};

const mockSimulationData = {
  simulation: [
    { alt_fuel_pct: 0, pred_energy_kwh_per_ton: 95.2, emissions_kgCO2_per_ton: 920 },
    { alt_fuel_pct: 10, pred_energy_kwh_per_ton: 92.8, emissions_kgCO2_per_ton: 885 },
    { alt_fuel_pct: 20, pred_energy_kwh_per_ton: 90.1, emissions_kgCO2_per_ton: 850 },
    { alt_fuel_pct: 30, pred_energy_kwh_per_ton: 87.9, emissions_kgCO2_per_ton: 815 },
    { alt_fuel_pct: 40, pred_energy_kwh_per_ton: 86.2, emissions_kgCO2_per_ton: 785 },
    { alt_fuel_pct: 50, pred_energy_kwh_per_ton: 85.8, emissions_kgCO2_per_ton: 760 },
    { alt_fuel_pct: 60, pred_energy_kwh_per_ton: 86.9, emissions_kgCO2_per_ton: 740 },
  ],
  optimal_fuel_pct: 50,
  max_energy_saving: 10.1,
  max_emission_reduction: 19.6,
};

const shouldUseMockData = () => {
  return false;
};

api?.interceptors?.request?.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api?.interceptors?.response?.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// API Hook: Get latest plant state/KPIs
export const useLatestState = (filters = {}) => {
  return useQuery({
    queryKey: ['latestState', filters],
    queryFn: async () => {
      if (shouldUseMockData()) {
        
        const now = new Date();
        let minTimestamp = new Date(now);
        
        switch(filters?.period) {
          case 'lastHour':
            minTimestamp.setHours(now.getHours() - 1);
            break;
          case 'currentShift':
            minTimestamp.setHours(now.getHours() - 8);
            break;
          case 'today':
            minTimestamp.setHours(0, 0, 0, 0);
            break;
          case 'thisWeek':
            minTimestamp.setDate(now.getDate() - 7);
            break;
          default:
            minTimestamp.setHours(now.getHours() - 1);
        }
        
        const randomTime = new Date(
          minTimestamp.getTime() + Math.random() * (now.getTime() - minTimestamp.getTime())
        );
        
        const variableMockData = {
          ...mockPlantData,
          plant_id: filters?.plant && filters.plant !== 'all'
            ? filters.plant
            : ['PlantA', 'PlantB', 'PlantC'][Math.floor(Math.random() * 3)],
          energy_use: mockPlantData?.energy_use + (Math.random() - 0.5) * 5,
          grinding_efficiency: mockPlantData?.grinding_efficiency + (Math.random() - 0.5) * 3,
          kiln_temp: mockPlantData?.kiln_temp + (Math.random() - 0.5) * 20,
          emissions: mockPlantData?.emissions + (Math.random() - 0.5) * 30,
          product_quality: mockPlantData?.product_quality + (Math.random() - 0.5) * 2,
          production_volume: mockPlantData?.production_volume + (Math.random() - 0.5) * 10,
          timestamp: randomTime.toISOString(),
          period: filters?.period || 'lastHour',
          period_start: minTimestamp.toISOString(),
          period_end: now.toISOString()
        };
        
        return new Promise((resolve) => {
          setTimeout(() => resolve(variableMockData), 500);
        });
      }

      try {
        const { data } = await api?.get('/latest_state', {
          params: {
            plant: filters?.plant || 'all',
            period: filters?.period || 'lastHour',
          },
        });
        
        const transformedData = {
          ...data,
          emissions: data.emissions_label ? getEmissionsFromLabel(data.emissions_label) : 850,
          product_quality: data.quality_label ? getQualityFromLabel(data.quality_label) : 95,
          production_volume: data.energy_use ? Math.max(100, 200 - (data.energy_use - 150) * 0.5) : 140,
          batch_id: data.batch_id || `B-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
          shift: data.shift || 'Current Shift',
          operator: data.operator || 'System Operator',
          status: 'operational',
          efficiency_score: data.grinding_efficiency || 90,
          quality_grade: data.quality_label >= 2 ? 'A+' : data.quality_label >= 1 ? 'A' : 'B',
          maintenance_status: 'operational',
          fuel_consumption: data.energy_use ? data.energy_use * 0.3 : 45,
          water_usage: 12.8,
          raw_material_inventory: (data.raw1_frac + data.raw2_frac) * 100 || 78.5,
        };
        
        return transformedData;
      } catch (error) {
        return mockPlantData;
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    retry: shouldUseMockData() ? false : 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: true,
  });
};

// API Hook: Run cycle (anomaly detection + recommendations)
export const useRunCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (shouldUseMockData()) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockData = {
              ...mockRecommendations,
              verified_saving_pct: mockRecommendations.verified_saving_pct + (Math.random() - 0.5) * 2,
              confidence_score: Math.min(0.99, mockRecommendations.confidence_score + (Math.random() - 0.5) * 0.1),
              execution_time: (2 + Math.random() * 3).toFixed(1) + 's',
            };
            resolve(mockData);
          }, 1500);
        });
      }

      try {
        const { data } = await api?.post('/run_cycle/');
        return data;
      } catch (error) {
        return mockRecommendations;
      }
    },
    onSuccess: (data) => {
      queryClient?.invalidateQueries({ queryKey: ['latestState'] });
    },
  });
};

// API Hook: Get AI recommendations
export const useRecommendation = () => {
  return useMutation({
    mutationFn: async (userInputs) => {
      if (shouldUseMockData()) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockRecommendations), 1000);
        });
      }

      try {
        const { data } = await api?.post('/recommendation', userInputs);
        return data;
      } catch (error) {
        return mockRecommendations;
      }
    },
  });
};

// API Hook: Simulate fuel scenarios
export const useSimulateFuel = () => {
  return useMutation({
    mutationFn: async (simulationParams = {}) => {
      if (shouldUseMockData()) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockSimulationData), 800);
        });
      }

      try {
        const { data } = await api?.get('/simulate_fuel', { params: simulationParams });
        return data;
      } catch (error) {
        return mockSimulationData;
      }
    },
  });
};

// Utility function to get threshold color for KPIs
export const getThresholdColor = (value, thresholds) => {
  if (!thresholds || value === undefined || value === null) return 'text-gray-500';
  
  if (value >= thresholds?.optimal) return 'text-green-600';
  if (value >= thresholds?.warning) return 'text-yellow-600';
  return 'text-red-600';
};

// Utility function to get threshold background color for cards
export const getThresholdBgColor = (value, thresholds) => {
  if (!thresholds || value === undefined || value === null) return 'bg-gray-50 border-gray-200';
  
  if (value >= thresholds?.optimal) return 'bg-green-50 border-green-200';
  if (value >= thresholds?.warning) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

// Helper functions to transform API labels to numeric values
const getEmissionsFromLabel = (label) => {
  // Assuming emissions_label: 0=low, 1=medium, 2=high emissions
  const emissionsMap = {
    0: 780, // Low emissions
    1: 850, // Medium emissions  
    2: 920, // High emissions
  };
  return emissionsMap[label] || 850;
};

const getQualityFromLabel = (label) => {
  // Assuming quality_label: 0=poor, 1=good, 2=excellent quality
  const qualityMap = {
    0: 88, // Poor quality
    1: 94, // Good quality
    2: 97, // Excellent quality
  };
  return qualityMap[label] || 94;
};

// Predefined thresholds for different KPIs
export const KPI_THRESHOLDS = {
  energy_use: { optimal: 180, warning: 220 }, // kWh/ton (based on your API data ~200)
  grinding_efficiency: { optimal: 90, warning: 85 }, // percentage
  kiln_temp: { optimal: 1450, warning: 1400 }, // Celsius
  emissions: { optimal: 850, warning: 900 }, // kg CO2/ton (lower is better)
  product_quality: { optimal: 95, warning: 90 }, // percentage
  production_volume: { optimal: 140, warning: 120 }, // tons/hr
};

// Hook to fetch historical plant data (168 records for weekly reports, 7 days × 24 hours)
// Hook to fetch configuration baselines
export const useBaselines = () => {
  return useQuery({
    queryKey: ['baselines'],
    queryFn: async () => {
      try {
        const { data } = await api?.get('/config/baselines');
        return data;
      } catch (error) {
        return {
          baseline_energy: 175.0,
          baseline_emissions: 130.0,
          baseline_efficiency: 85.0,
        };
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - baselines don't change often
    retry: 2,
  });
};

// Hook to fetch recent alerts with real-time polling
export const useRecentAlerts = (options = {}) => {
  const { limit = 50, severity = null, refetchInterval = 30000 } = options; // Poll every 30 seconds
  
  return useQuery({
    queryKey: ['recentAlerts', limit, severity],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append('limit', limit);
        if (severity) params.append('severity', severity);
        
        const { data } = await api?.get(`/alerts/recent?${params.toString()}`);
        return data?.alerts || [];
      } catch (error) {
        return [];
      }
    },
    refetchInterval: refetchInterval, // Auto-refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
    retry: 2,
  });
};

// Hook to acknowledge an alert
export const useAcknowledgeAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ alert_id, acknowledged_by }) => {
      const { data } = await api?.post('/alerts/acknowledge', {
        alert_id,
        acknowledged_by
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recentAlerts']);
    },
  });
};

// Hook to trigger anomaly check (stores in Firestore)
export const useCheckAnomalies = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api?.post('/alerts/check-now');
        return data;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403 || !error?.response) {
          return { 
            success: true, 
            message: 'Mock check completed',
            timestamp: new Date().toISOString() 
          };
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['recentAlerts']);
    },
  });
};

// Hook to fetch historical plant data (168 records for weekly reports, 7 days × 24 hours)
export const useHistoryData = () => {
  return useQuery({
    queryKey: ['historyData'],
    queryFn: async () => {
      if (shouldUseMockData()) {
        const mockHistoryData = Array.from({ length: 168 }, (_, index) => {
          const baseTime = new Date(Date.now() - index * 60 * 60 * 1000); // Each record 1 hour apart
          const improvementFactor = index / 168; // 0 (recent) to 1 (old)
          
          return {
            timestamp: baseTime.toISOString(),
            plant_id: ['PlantA', 'PlantB', 'PlantC'][index % 3],
            raw1_frac: 0.65 + Math.random() * 0.1,
            raw2_frac: 0.30 + Math.random() * 0.1,
            grinding_efficiency: 88 + Math.random() * 6 - improvementFactor * 8,
            kiln_temp: 1440 + Math.random() * 40,
            fan_speed: 85 + Math.random() * 15,
            energy_use: 160 + Math.random() * 20 + improvementFactor * 40,
            emissions_CO2: 100 + Math.random() * 15 + improvementFactor * 20,
            emissions_label: Math.floor(Math.random() * 3),
            quality_label: Math.floor(Math.random() * 3),
            product_quality_index: 80 + Math.random() * 10 - improvementFactor * 8,
            hour_of_day: baseTime.getHours(),
            day_of_week: baseTime.getDay(),
            prev_energy_use: 200 + Math.random() * 80,
            energy_ma_3: 220 + Math.random() * 40,
          };
        });
        
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockHistoryData), 800); // Simulate network delay
        });
      }

      try {
        const { data } = await api?.get('/history', {
          params: {
            // Optionally accept filters in future extensions
          },
        });
        
        // Transform each historical record similar to latest_state
        const transformedHistory = data.map(record => ({
          ...record,
          emissions: record.emissions_label ? getEmissionsFromLabel(record.emissions_label) : 850,
          product_quality: record.quality_label ? getQualityFromLabel(record.quality_label) : 95,
          production_volume: record.energy_use ? Math.max(100, 200 - (record.energy_use - 150) * 0.5) : 140,
          efficiency_score: record.grinding_efficiency || 90,
          quality_grade: record.quality_label >= 2 ? 'A+' : record.quality_label >= 1 ? 'A' : 'B',
          fuel_consumption: record.energy_use ? record.energy_use * 0.3 : 45,
        }));
        
        return transformedHistory;
      } catch (error) {
        const mockHistoryData = Array.from({ length: 168 }, (_, index) => {
          const baseTime = new Date(Date.now() - index * 60 * 60 * 1000);
          const improvementFactor = index / 168; // 0 (recent) to 1 (old)
          
          return {
            timestamp: baseTime.toISOString(),
            raw1_frac: 0.65 + Math.random() * 0.1,
            raw2_frac: 0.30 + Math.random() * 0.1,
            grinding_efficiency: 88 + Math.random() * 6 - improvementFactor * 8,
            kiln_temp: 1440 + Math.random() * 40,
            fan_speed: 85 + Math.random() * 15,
            energy_use: 160 + Math.random() * 20 + improvementFactor * 40,
            emissions_CO2: 100 + Math.random() * 15 + improvementFactor * 20,
            emissions_label: Math.floor(Math.random() * 3),
            quality_label: Math.floor(Math.random() * 3),
            product_quality_index: 80 + Math.random() * 10 - improvementFactor * 8,
            hour_of_day: baseTime.getHours(),
            day_of_week: baseTime.getDay(),
            prev_energy_use: 200 + Math.random() * 80,
            energy_ma_3: 220 + Math.random() * 40,
            emissions: 100 + Math.random() * 15 + improvementFactor * 20,
            product_quality: 80 + Math.random() * 10 - improvementFactor * 8,
            production_volume: 120 + Math.random() * 40,
            efficiency_score: 88 + Math.random() * 6 - improvementFactor * 8,
          };
        });
        return mockHistoryData;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes (history changes less frequently)
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
    retry: shouldUseMockData() ? false : 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export { getEmissionsFromLabel, getQualityFromLabel };

export default api;
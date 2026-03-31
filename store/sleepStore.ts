import { create } from 'zustand';

interface SleepMetrics {
  durationScore: number;
  efficiencyScore: number;
  deepSleepScore: number;
  remSleepScore: number;
  hrvScore: number;
  overallScore: number;
}

interface SleepState {
  metrics: SleepMetrics | null;
  timeseries: number[] | null;
  isAnalyzing: boolean;
  setAnalysisData: (metrics: SleepMetrics, timeseries: number[]) => void;
  setAnalyzing: (status: boolean) => void;
}

export const useSleepStore = create<SleepState>((set) => ({
  metrics: null,
  timeseries: null,
  isAnalyzing: false,
  setAnalysisData: (metrics, timeseries) => set({ metrics, timeseries, isAnalyzing: false }),
  setAnalyzing: (status) => set({ isAnalyzing: status }),
}));

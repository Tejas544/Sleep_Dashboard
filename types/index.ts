// types/index.ts

// The 4 standard clinical sleep stages
export type SleepStage = "Wake" | "Light" | "Deep" | "REM";

// Represents a single point in time (an "epoch", typically 30 seconds in clinical sleep scoring)
export interface SleepEpoch {
  timestamp: string;      // e.g., "2023-10-27T23:30:00"
  heartRate: number;      // Beats per minute
  respiration: number;    // Breaths per minute
  spo2?: number;          // Blood Oxygen % (Optional, depending on sensor)
  stage: SleepStage;      // The output predicted by the ML model
}

// Represents an abnormal event flagged by the system
export interface SleepAnomaly {
  id: string;
  timestamp: string;
  type: "Apnea" | "Tachycardia" | "Bradycardia" | "Desaturation";
  severity: "Low" | "Medium" | "High" | "Critical";
  durationSeconds: number;
  description: string;
}

// Aggregated stats for the dashboard overview cards
export interface SleepSummary {
  totalSleepMinutes: number;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  lightSleepMinutes: number;
  awakeMinutes: number;
  overallScore: number;   // 0-100 calculated score
}

// The complete payload that drives the entire dashboard
export interface DashboardData {
  success: boolean;
  metrics: {
    durationScore: number;
    efficiencyScore: number;
    deepSleepScore: number;
    remSleepScore: number;
    hrvScore: number;
    overallScore: number;
  };
  timeseries: number[];
}

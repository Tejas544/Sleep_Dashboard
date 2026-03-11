import Papa from 'papaparse';
import { DashboardData, SleepEpoch, SleepAnomaly, SleepSummary, SleepStage } from '../types';

const API_URL = "https://backend-isp-1.onrender.com/predict"; 

// --- HELPER FUNCTIONS ---
function mapClinicalStageToUI(rawStage: string): SleepStage {
    const normalized = rawStage.toUpperCase().trim();
    if (normalized === 'N3' || normalized === 'DEEP') return 'Deep';
    if (normalized === 'N1' || normalized === 'N2' || normalized === 'LIGHT') return 'Light';
    if (normalized === 'REM') return 'REM';
    return 'Wake';
}

function calculateSleepScore(epochs: SleepEpoch[]): number {
    if (epochs.length === 0) return 0;
    const total = epochs.length;
    const deep = epochs.filter(e => e.stage === 'Deep').length;
    const rem = epochs.filter(e => e.stage === 'REM').length;
    const awake = epochs.filter(e => e.stage === 'Wake').length;

    const deepPct = deep / total;
    const remPct = rem / total;
    const awakePct = awake / total;

    const score = (deepPct * 40) + (remPct * 30) + ((1 - awakePct) * 30);
    return Math.min(Math.max(Math.round(score * 100), 0), 100);
}

function detectAnomalies(epochs: SleepEpoch[]): SleepAnomaly[] {
    const anomalies: SleepAnomaly[] = [];
    epochs.forEach((epoch, index) => {
        if (epoch.stage === 'Deep' && epoch.heartRate > 80) {
            anomalies.push({
                id: `anom-hr-${index}`,
                timestamp: epoch.timestamp,
                type: 'Tachycardia',
                severity: 'Medium',
                durationSeconds: 30,
                description: `Elevated heart rate (${epoch.heartRate.toFixed(1)} bpm) detected during Deep Sleep.`
            });
        }
    });
    return anomalies;
}

// --- MAIN PIPELINE ---
export const processCSVData = (file: File): Promise<DashboardData> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: async (results) => {
                try {
                    const rawData = results.data as any[];
                    const baseTime = new Date('2023-10-27T22:00:00Z').getTime();

                    // 1. DEFENSIVE EXTRACTION: Handle NaNs to prevent Python crashes
                    let heartRates = rawData.map(row => row.HR !== undefined ? Number(row.HR) : Number(row.heart_rate));
                    heartRates = heartRates.map(hr => isNaN(hr) ? 60.0 : hr);

                    if (heartRates.length === 0) {
                        throw new Error("No heart rate data found in CSV.");
                    }

                    // 2. Execute API Call
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ heart_rate: heartRates })
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`API Inference Failed: ${errorData.detail || response.statusText}`);
                    }

                    const apiData = await response.json();
                    const predictedStages = apiData.stages;

                    if (predictedStages.length !== rawData.length) {
                        throw new Error("Mismatch between CSV rows and API prediction output length.");
                    }

                    // 3. Construct Epochs
                    const epochs: SleepEpoch[] = rawData.map((row, index) => {
                        const rawTime = row.TIMESTAMP !== undefined ? row.TIMESTAMP : row.timestamp;
                        
                        // FIX: Assuming TIMESTAMP is in seconds. Convert to milliseconds.
                        const timeOffsetMs = Number(rawTime) * 1000; 
                        const validTimestamp = new Date(baseTime + timeOffsetMs).toISOString();

                        const resp = row.respiration !== undefined ? row.respiration : (14 + Math.random() * 3);

                        return {
                            timestamp: validTimestamp,
                            heartRate: heartRates[index],
                            respiration: Number(resp),
                            stage: mapClinicalStageToUI(predictedStages[index])
                        };
                    });

                    // 4. Calculate Summaries based on 20Hz Frequency
                    // 1 row = 1/20th of a second. Convert to minutes.
                    const epochDurationMinutes = 1 / 1200; 
                    let deepMin = 0, remMin = 0, lightMin = 0, awakeMin = 0;

                    epochs.forEach(e => {
                        if (e.stage === 'Deep') deepMin += epochDurationMinutes;
                        else if (e.stage === 'REM') remMin += epochDurationMinutes;
                        else if (e.stage === 'Light') lightMin += epochDurationMinutes;
                        else if (e.stage === 'Wake') awakeMin += epochDurationMinutes;
                    });

                    const summary: SleepSummary = {
                        totalSleepMinutes: deepMin + remMin + lightMin,
                        deepSleepMinutes: deepMin,
                        remSleepMinutes: remMin,
                        lightSleepMinutes: lightMin,
                        awakeMinutes: awakeMin,
                        overallScore: calculateSleepScore(epochs)
                    };

                    const anomalies = detectAnomalies(epochs);

                    resolve({
                        patientId: "LIVE-PATIENT-001", 
                        recordingDate: epochs.length > 0 ? epochs[0].timestamp : new Date().toISOString(),
                        summary,
                        timeseries: epochs,
                        anomalies
                    });
                } catch (error) {
                    console.error(error);
                    reject(error);
                }
            },
            error: (error) => reject(error)
        });
    });
};
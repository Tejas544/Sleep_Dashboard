import Papa from 'papaparse';
import { DashboardData, SleepEpoch, SleepAnomaly, SleepSummary, SleepStage } from '../types';

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

export const processCSVData = (file: File): Promise<DashboardData> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                try {
                    const rawData = results.data as any[];
                    
                    // Base time to convert raw numeric timestamps into absolute dates
                    // We assume the recording started at 10:00 PM for visualization
                    const baseTime = new Date('2023-10-27T22:00:00Z').getTime();

                    const epochs: SleepEpoch[] = rawData.map((row) => {
                        // 1. Handle flexible column headers (Professor's vs Standard)
                        const rawTime = row.TIMESTAMP !== undefined ? row.TIMESTAMP : row.timestamp;
                        const hr = row.HR !== undefined ? row.HR : row.heart_rate;
                        
                        // Create a valid ISO timestamp. 
                        // Assuming rawTime is elapsed seconds or minutes. Let's treat it as minutes.
                        const timeOffsetMs = Number(rawTime) * 60 * 1000;
                        const validTimestamp = new Date(baseTime + timeOffsetMs).toISOString();

                        // 2. MOCK THE ML MODEL
                        // If stage is missing, guess it based on heart rate to test the UI
                        let predictedStage = 'Light';
                        if (row.stage) {
                            predictedStage = row.stage;
                        } else {
                            if (hr > 80) predictedStage = 'Wake';
                            else if (hr < 70) predictedStage = 'Deep';
                            else if (hr > 75) predictedStage = 'REM';
                        }

                        // Mock respiration if missing (baseline 15 +- slight variation)
                        const resp = row.respiration !== undefined ? row.respiration : (14 + Math.random() * 3);

                        return {
                            timestamp: validTimestamp,
                            heartRate: Number(hr),
                            respiration: Number(resp),
                            stage: mapClinicalStageToUI(predictedStage) 
                        };
                    });

                    // Standard 30-second epoch math (0.5 mins)
                    const epochDurationMinutes = 0.5; 
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
                        patientId: "PROF-TEST-001", 
                        recordingDate: epochs.length > 0 ? epochs[0].timestamp : new Date().toISOString(),
                        summary,
                        timeseries: epochs,
                        anomalies
                    });
                } catch (error) {
                    reject(new Error("Data transformation failed. Could not process TIMESTAMP or HR columns."));
                }
            },
            error: (error) => reject(error)
        });
    });
};
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SleepEpoch } from '../types';
import { Loader2 } from 'lucide-react';

// SSR-safe Plotly import
const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    )
});

interface SignalChartsProps {
    data: SleepEpoch[];
}

export default function SignalCharts({ data }: SignalChartsProps) {
    if (!data || data.length === 0) return null;

    // Extract time-series vectors
    const timestamps = data.map(d => d.timestamp);
    const heartRates = data.map(d => d.heartRate);
    const respirations = data.map(d => d.respiration);

    return (
        <div className="w-full h-96 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-2">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Physiological Signals</h3>
                <p className="text-xs text-gray-500 font-medium">Heart Rate (BPM) and Respiration synchronized over time.</p>
            </div>
            
            <div className="w-full h-[calc(100%-3rem)]">
                <Plot
                    data={[
                        {
                            x: timestamps,
                            y: heartRates,
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: '#ef4444', width: 2 }, // Red for Heart Rate
                            name: 'Heart Rate',
                            fill: 'tozeroy',
                            fillcolor: 'rgba(239, 68, 68, 0.05)',
                        },
                        {
                            x: timestamps,
                            y: respirations,
                            yaxis: 'y2', // Maps this trace to the secondary Y-axis layout below
                            type: 'scatter',
                            mode: 'lines',
                            line: { color: '#10b981', width: 2 }, // Green for Respiration
                            name: 'Respiration',
                            fill: 'tozeroy',
                            fillcolor: 'rgba(16, 185, 129, 0.05)',
                        }
                    ]}
                    layout={{
                        autosize: true,
                        margin: { l: 50, r: 20, t: 10, b: 40 },
                        hoverlabel: {
                            bgcolor: '#ffffff',     // Solid white background
                            bordercolor: '#e5e7eb', // Light gray border
                            font: { color: '#1f2937', size: 12, family: 'sans-serif' },
                            align: 'left'
                        },
                        // --- THE SUBPLOT MAGIC ---
                        // We divide the Y-axis space into two domains (top and bottom)
                        // Top 45% for Heart Rate
                        yaxis: {
                            domain: [0.55, 1],
                            title: { text: 'BPM', font: { size: 10 } },
                            gridcolor: '#f3f4f6',
                            fixedrange: true
                        },
                        // Bottom 45% for Respiration
                        yaxis2: {
                            domain: [0, 0.45],
                            title: { text: 'Breaths/m', font: { size: 10 } },
                            gridcolor: '#f3f4f6',
                            fixedrange: true
                        },
                        xaxis: {
                            type: 'date',
                            gridcolor: '#f3f4f6',
                            tickformat: '%H:%M',
                        },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        hovermode: 'x unified', // Critical: Shows a single hover tooltip for BOTH signals at that exact timestamp
                        showlegend: false // Hides legend to save space, colors are obvious
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                />
            </div>
        </div>
    );
}
'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    )
});

interface HypnogramProps {
    timeseries: number[];
}

// Map the Python output integers to clinical labels
const STAGE_LABELS: Record<number, string> = {
    0: 'Wake',
    1: 'N1 (Light)',
    2: 'N2 (Light)',
    3: 'N3 (Deep)',
    4: 'REM',
    5: 'Movement',
    6: 'Unscored'
};

export default function Hypnogram({ timeseries }: HypnogramProps) {
    if (!timeseries || timeseries.length === 0) return null;

    // Generate pseudo-timestamps (each window is 32 seconds)
    // Starting from a generic 10:00 PM
    const startTime = new Date();
    startTime.setHours(22, 0, 0, 0);

    const timestamps = timeseries.map((_, i) => {
        const t = new Date(startTime.getTime());
        t.setSeconds(t.getSeconds() + (i * 32));
        return t;
    });

    // In a clinical hypnogram, Wake is at the top, Deep sleep is at the bottom.
    // We reverse the Y-axis mapping to achieve this visual drop.
    const Y_MAPPING: Record<number, number> = {
        0: 4, // Wake (Top)
        4: 3, // REM
        1: 2, // N1
        2: 2, // N2
        3: 1, // N3 (Bottom)
        5: 4, // Movement (treat as Wake visually)
        6: 4  // Unscored
    };

    const yValues = timeseries.map(stage => Y_MAPPING[stage]);
    const hoverTexts = timeseries.map((stage, i) => 
        `Time: ${timestamps[i].toLocaleTimeString()}<br>Stage: <b>${STAGE_LABELS[stage]}</b>`
    );

    return (
        <div className="w-full p-4 bg-white border border-gray-200 shadow-sm h-80 rounded-xl">
            <div className="mb-2">
                <h3 className="text-lg font-black tracking-tight text-gray-900">Sleep Architecture (Hypnogram)</h3>
                <p className="text-xs font-medium text-gray-500">Progression of sleep cycles based on ML inference.</p>
            </div>
            
            <div className="w-full h-[calc(100%-3rem)]">
                <Plot
                    data={[
                        {
                            x: timestamps,
                            y: yValues,
                            type: 'scatter',
                            mode: 'lines',
                            line: { shape: 'hv', color: '#3b82f6', width: 2 }, 
                            fill: 'tozeroy',
                            fillcolor: 'rgba(59, 130, 246, 0.1)',
                            name: 'Sleep Stage',
                            hoverinfo: 'text',
                            text: hoverTexts
                        }
                    ]}
                    layout={{
                        autosize: true,
                        margin: { l: 50, r: 20, t: 10, b: 40 },
                        hoverlabel: {
                            bgcolor: '#ffffff',
                            bordercolor: '#e5e7eb',
                            font: { color: '#1f2937', size: 12, family: 'sans-serif' },
                            align: 'left'
                        },
                        yaxis: {
                            tickvals: [1, 2, 3, 4],
                            ticktext: ['Deep (N3)', 'Light (N1/N2)', 'REM', 'Wake'],
                            fixedrange: true,
                            zeroline: false,
                            gridcolor: '#f3f4f6'
                        },
                        xaxis: {
                            type: 'date',
                            gridcolor: '#f3f4f6',
                            tickformat: '%H:%M'
                        },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        hovermode: 'x unified'
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                />
            </div>
        </div>
    );
}

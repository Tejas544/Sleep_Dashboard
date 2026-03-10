'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SleepEpoch } from '../types';
import { Loader2 } from 'lucide-react';

// Crucial: Dynamically import Plotly to prevent Next.js Server-Side Rendering crashes
const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    )
});

interface HypnogramProps {
    data: SleepEpoch[];
}

// Map text stages to numeric values so Plotly can draw them on a Y-axis
const STAGE_MAP: Record<string, number> = {
    'Deep': 0,
    'Light': 1,
    'REM': 2,
    'Wake': 3
};

export default function Hypnogram({ data }: HypnogramProps) {
    if (!data || data.length === 0) return null;

    // Extract arrays for X (time) and Y (numeric stage) axes
    const timestamps = data.map(d => d.timestamp);
    const yValues = data.map(d => STAGE_MAP[d.stage]);
    const hoverTexts = data.map(d => `Time: ${new Date(d.timestamp).toLocaleTimeString()}<br>Stage: <b>${d.stage}</b>`);

    return (
        <div className="w-full h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-2">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Sleep Architecture (Hypnogram)</h3>
                <p className="text-xs text-gray-500 font-medium">Progression of sleep cycles over time.</p>
            </div>
            
            <div className="w-full h-[calc(100%-3rem)]">
                <Plot
                    data={[
                        {
                            x: timestamps,
                            y: yValues,
                            type: 'scatter',
                            mode: 'lines',
                            line: { 
                                shape: 'hv', // 'hv' = horizontal then vertical (creates the step effect)
                                color: '#3b82f6', 
                                width: 2 
                            }, 
                            fill: 'tozeroy',
                            fillcolor: 'rgba(59, 130, 246, 0.1)',
                            name: 'Sleep Stage',
                            hoverinfo: 'text',
                            text: hoverTexts // Replaces the raw 0,1,2,3 with readable text on hover
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
                        yaxis: {
                            tickvals: [0, 1, 2, 3],
                            ticktext: ['Deep', 'Light', 'REM', 'Wake'],
                            fixedrange: true, // Lock Y-axis zooming so the stages don't stretch weirdly
                            zeroline: false,
                            gridcolor: '#f3f4f6'
                        },
                        xaxis: {
                            type: 'date',
                            gridcolor: '#f3f4f6',
                            tickformat: '%H:%M' // Show hours:minutes
                        },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        hovermode: 'x unified' // Shows a vertical line connecting all data points at a timestamp
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }} // Hides the clunky Plotly toolbar
                />
            </div>
        </div>
    );
}
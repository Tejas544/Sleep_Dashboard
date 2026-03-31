'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { DashboardData } from '../types';

const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
    )
});

interface SleepArchitectureProps {
    metrics: DashboardData['metrics'];
    timeseries: number[]; // Added to accept the raw array
}

export default function SleepArchitecture({ metrics, timeseries }: SleepArchitectureProps) {
    if (!metrics || !timeseries) return null;

    // Calculate ACTUAL precise times spent in each stage
    let awakeCount = 0;
    let lightCount = 0;
    let deepCount = 0;
    let remCount = 0;

    timeseries.forEach(stage => {
        if (stage === 0 || stage === 5 || stage === 6) awakeCount++; // Wake, Movement, Unscored
        else if (stage === 1 || stage === 2) lightCount++;           // N1, N2 (Light)
        else if (stage === 3) deepCount++;                           // N3 (Deep)
        else if (stage === 4) remCount++;                            // REM
    });

    const values = [deepCount, lightCount, remCount, awakeCount];
    const labels = ['Deep Sleep', 'Light (N1/N2)', 'REM', 'Awake'];
    const colors = ['#3b82f6', '#93c5fd', '#10b981', '#ef4444'];

    return (
        <div className="flex flex-col w-full p-4 bg-white border border-gray-200 shadow-sm h-80 rounded-xl">
            <div className="mb-2">
                <h3 className="text-lg font-black tracking-tight text-gray-900">Sleep Stage Distribution</h3>
                <p className="text-xs font-medium text-gray-500">Actual time spent in clinical epochs.</p>
            </div>
            
            <div className="relative flex-1 w-full">
                <Plot
                    data={[
                        {
                            values: values,
                            labels: labels,
                            type: 'pie',
                            hole: 0.6,
                            marker: { colors: colors },
                            textinfo: 'label+percent',
                            hoverinfo: 'label+percent',
                            hovertemplate: '<b>%{label}</b><br>%{percent}<extra></extra>',
                        }
                    ]}
                    layout={{
                        autosize: true,
                        margin: { l: 20, r: 20, t: 20, b: 20 },
                        showlegend: false,
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        annotations: [
                            {
                                font: { size: 24, family: 'sans-serif', color: '#111827' }, 
                                showarrow: false,
                                text: `<b>${metrics.overallScore}</b>`,
                                x: 0.5,
                                y: 0.53
                            },
                            {
                                font: { size: 10, color: '#6b7280' },
                                showarrow: false,
                                text: 'OVERALL',
                                x: 0.5,
                                y: 0.43
                            }
                        ]
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                />
            </div>
        </div>
    );
}

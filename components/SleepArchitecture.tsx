'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SleepSummary } from '../types';
import { Loader2 } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    )
});

interface SleepArchitectureProps {
    summary: SleepSummary;
}

export default function SleepArchitecture({ summary }: SleepArchitectureProps) {
    if (!summary) return null;

    // Extract values for the pie chart
    const values = [
        summary.deepSleepMinutes,
        summary.lightSleepMinutes,
        summary.remSleepMinutes,
        summary.awakeMinutes
    ];
    
    const labels = ['Deep Sleep', 'Light Sleep', 'REM', 'Awake'];
    
    // Standard clinical color mapping
    const colors = ['#3b82f6', '#93c5fd', '#10b981', '#ef4444'];

    return (
        <div className="w-full h-80 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="mb-2">
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Sleep Architecture</h3>
                <p className="text-xs text-gray-500 font-medium">Distribution of sleep stages.</p>
            </div>
            
            <div className="flex-1 w-full relative">
                <Plot
                    data={[
                        {
                            values: values,
                            labels: labels,
                            type: 'pie',
                            hole: 0.6, // Creates the Donut effect
                            marker: { colors: colors },
                            textinfo: 'label+percent',
                            hoverinfo: 'label+value+percent',
                            hovertemplate: '<b>%{label}</b><br>%{value} mins<br>%{percent}<extra></extra>',
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
                                text: `<b>${summary.overallScore}</b>`,
                                x: 0.5,
                                y: 0.53
                            },
                            {
                                font: { size: 10, color: '#6b7280' },
                                showarrow: false,
                                text: 'SCORE',
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
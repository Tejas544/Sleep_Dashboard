'use client';

import React from 'react';
import { SleepAnomaly } from '../types';
import { AlertTriangle, Activity, Wind, AlertCircle } from 'lucide-react';

interface AnomalyLogProps {
    anomalies: SleepAnomaly[];
}

export default function AnomalyLog({ anomalies }: AnomalyLogProps) {
    // Helper to render the correct icon based on the anomaly type
    const getIcon = (type: string) => {
        switch (type) {
            case 'Apnea': return <Wind className="w-4 h-4 text-red-500" />;
            case 'Tachycardia': 
            case 'Bradycardia': return <Activity className="w-4 h-4 text-yellow-500" />;
            default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
        }
    };

    // Helper to render severity badges
    const getSeverityBadge = (severity: string) => {
        const baseClass = "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full";
        switch (severity) {
            case 'Critical': return `${baseClass} bg-red-100 text-red-700`;
            case 'High': return `${baseClass} bg-orange-100 text-orange-700`;
            case 'Medium': return `${baseClass} bg-yellow-100 text-yellow-700`;
            default: return `${baseClass} bg-gray-100 text-gray-700`;
        }
    };

    return (
        <div className="w-full h-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                        Detected Anomalies
                        {anomalies.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {anomalies.length}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Events flagged by the ML engine.</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
                {anomalies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No anomalies detected.</p>
                        <p className="text-xs">Patient metrics remained within normal clinical bounds.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {anomalies.map((anomaly) => (
                            <li key={anomaly.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 p-1.5 bg-white rounded-md border border-gray-100 shadow-sm">
                                        {getIcon(anomaly.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-bold text-gray-900">{anomaly.type}</h4>
                                            <span className="text-xs text-gray-400 font-mono">
                                                {new Date(anomaly.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                            {anomaly.description}
                                        </p>
                                        <div className="flex gap-2 items-center">
                                            <span className={getSeverityBadge(anomaly.severity)}>
                                                {anomaly.severity}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Duration: {anomaly.durationSeconds}s
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
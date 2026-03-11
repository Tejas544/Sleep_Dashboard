'use client';

import React, { useEffect, useState } from 'react';
import { SleepSummary, SleepAnomaly } from '../types';
import { Sparkles, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RecommendationsProps {
    summary: SleepSummary;
    anomalies: SleepAnomaly[];
}

interface LLMResponse {
    assessment: string;
    warnings: string;
    recommendations: string[];
}

export default function Recommendations({ summary, anomalies }: RecommendationsProps) {
    const [insights, setInsights] = useState<LLMResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const response = await fetch('/api/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ summary, anomalies }),
                });

                if (!response.ok) throw new Error("Failed to fetch AI insights");

                const data = await response.json();
                setInsights(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsights();
    }, [summary, anomalies]);

    if (error) {
        return (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠️ LLM Engine Error: {error}
            </div>
        );
    }

    return (
        <div className="w-full bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl shadow-lg border border-indigo-800 p-6 text-white">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-black tracking-tight">AI Clinical Insights</h3>
                {isLoading && <span className="text-xs font-mono ml-auto animate-pulse text-indigo-300">Generating...</span>}
            </div>

            {isLoading || !insights ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>
            ) : (
                <div className="space-y-5">
                    <div>
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Assessment
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-200">{insights.assessment}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Clinical Warnings
                        </h4>
                        <p className="text-sm leading-relaxed text-orange-100">{insights.warnings}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Action Plan
                        </h4>
                        <ul className="space-y-2">
                            {insights.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-slate-200 flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                    <span className="text-emerald-400 font-bold">{idx + 1}.</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
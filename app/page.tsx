'use client';

import React, { useState } from 'react';
import { DashboardData } from '../types';
import FileUpload from '../components/FileUpload';
import Hypnogram from '../components/Hypnogram';
import SignalCharts from '../components/SignalCharts';
import SleepArchitecture from '../components/SleepArchitecture';
import AnomalyLog from '../components/AnomalyLog';
import Recommendations from '../components/Recommendations'; // <-- NEW IMPORT
import { Moon, Clock, BrainCircuit, Activity, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  // Helper to format decimal minutes into Hours and Minutes
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                InfoSys PRO AI
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Clinical Staging & Diagnostics 
              </p>
            </div>
          </div>

          {/* Reset Button */}
          {data && (
            <button
              onClick={() => setData(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Patient
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* STATE 1: UPLOAD SCREEN */}
        {!data ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                Upload Sensor Data
              </h2>
              <p className="text-slate-500">
                Process raw time-series CSVs into clinical sleep staging and anomaly reports.
              </p>
            </div>
            <FileUpload onDataLoaded={setData} />
          </div>
        ) : (
          
          /* STATE 2: DASHBOARD SCREEN */
          <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
            
            {/* KPI METRICS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard 
                title="Total Sleep Time" 
                value={formatTime(data.summary.totalSleepMinutes)} 
                icon={<Clock className="w-5 h-5 text-blue-500" />} 
              />
              <KpiCard 
                title="Deep Sleep" 
                value={`${Math.round((data.summary.deepSleepMinutes / data.summary.totalSleepMinutes) * 100 || 0)}%`} 
                subtext={formatTime(data.summary.deepSleepMinutes)}
                icon={<Activity className="w-5 h-5 text-emerald-500" />} 
              />
              <KpiCard 
                title="REM Sleep" 
                value={`${Math.round((data.summary.remSleepMinutes / data.summary.totalSleepMinutes) * 100 || 0)}%`} 
                subtext={formatTime(data.summary.remSleepMinutes)}
                icon={<BrainCircuit className="w-5 h-5 text-purple-500" />} 
              />
              <KpiCard 
                title="Clinical Score" 
                value={data.summary.overallScore.toString()} 
                subtext="/ 100"
                icon={<Moon className="w-5 h-5 text-amber-500" />} 
              />
            </div>

            {/* MAIN CHART ROW (HYPNOGRAM) */}
            <div className="w-full">
               <Hypnogram data={data.timeseries} />
            </div>

            {/* SPLIT ROW: SIGNALS & DIAGNOSTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Left Column: Takes up 2/3 of the space on desktop */}
               <div className="lg:col-span-2 space-y-6">
                 <SignalCharts data={data.timeseries} />
               </div>

               {/* Right Column: Takes up 1/3 of the space on desktop */}
               <div className="lg:col-span-1 space-y-6">
                 <SleepArchitecture summary={data.summary} />
                 <AnomalyLog anomalies={data.anomalies} />
               </div>

            </div>

            {/* AI RECOMMENDATIONS ROW (Full Width) */}
            <div className="w-full mt-6">
                <Recommendations summary={data.summary} anomalies={data.anomalies} />
            </div>
            
            {/* FOOTER METADATA */}
            <div className="flex justify-between items-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200">
              <p>Patient ID: <span className="font-mono font-bold text-slate-500">{data.patientId}</span></p>
              <p>Analyzed: {new Date().toLocaleString()}</p>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------
// Micro-Component: KPI Card for the top row
// ----------------------------------------------------------------------
function KpiCard({ title, value, subtext, icon }: { title: string, value: string | number, subtext?: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-black text-slate-900">{value}</h4>
          {subtext && <span className="text-xs font-bold text-slate-400">{subtext}</span>}
        </div>
      </div>
      <div className="bg-slate-50 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
}
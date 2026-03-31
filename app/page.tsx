'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import { DashboardData } from '../types';
import FileUpload from '../components/FileUpload';
import Hypnogram from '../components/Hypnogram';
import SleepArchitecture from '../components/SleepArchitecture';
// Commented out components that require raw physiological data or LLM anomaly logs
// import SignalCharts from '../components/SignalCharts';
// import AnomalyLog from '../components/AnomalyLog';
// import Recommendations from '../components/Recommendations';
import { Moon, BrainCircuit, Activity, RefreshCw, LogOut, CreditCard, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // 1. Extract pure state from Zustand
  const { token, practitioner, logout } = useAuthStore();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Hydration Guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 3. Strict Auth Guard
  useEffect(() => {
    if (isMounted && !token) {
      router.push('/login');
    }
  }, [isMounted, token, router]);

  // Prevent UI flash before redirect
  if (!isMounted || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen font-medium bg-slate-50 text-slate-500">
        Loading secure environment...
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-12 font-sans bg-slate-50 text-slate-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none tracking-tight text-slate-900">
                InfoSys PRO AI
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Clinical Staging & Diagnostics 
              </p>
            </div>
          </div>

          {/* AUTH & ACTIONS */}
          <div className="flex items-center gap-3">
            {data && (
              <button
                onClick={() => setData(null)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                <RefreshCw className="w-4 h-4" /> New Patient
              </button>
            )}

            <button
              onClick={() => router.push('/pricing')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <CreditCard className="w-4 h-4" /> Pricing
            </button>

            {/* Re-wired Logout Button */}
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-all rounded-lg bg-slate-900 hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 mx-auto mt-8 max-w-7xl">
        {!data ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-black tracking-tight uppercase text-slate-900">
                Welcome back, {practitioner?.fullName}
              </h2>
              <p className="text-slate-500">
                Upload patient heart rate data to generate an AI Clinical Analysis.
              </p>
            </div>
            <FileUpload onDataLoaded={setData} />
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
            
            {/* KPI METRICS ROW: Updated to read from data.metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <KpiCard title="Overall Clinical Score" value={Math.min(100,data.metrics.overallScore)} subtext="/ 100" icon={<Moon className="w-5 h-5 text-amber-500" />} />
              <KpiCard title="Sleep Efficiency" value={`${Math.min(100,data.metrics.efficiencyScore)}%`} icon={<Activity className="w-5 h-5 text-blue-500" />} />
              <KpiCard title="Deep Sleep Score" value={`${Math.min(100,data.metrics.deepSleepScore)}%`} icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />} />
              <KpiCard title="REM Sleep Score" value={`${Math.min(100,data.metrics.remSleepScore)}%`} icon={<BrainCircuit className="w-5 h-5 text-purple-500" />} />
            </div>

            {/* HYPNOGRAM: Now accepts the timeseries integer array */}
            <div className="w-full">
               <Hypnogram timeseries={data.timeseries} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
               {/* SignalCharts disabled until Python returns raw HR array */}
               {/* <div className="space-y-6 lg:col-span-2">
                 <SignalCharts data={data.timeseries} />
               </div> */}
               
               {/* SLEEP ARCHITECTURE: Now spans wider to fill space, accepts metrics object */}
               <div className="space-y-6 lg:col-span-3">
                 <SleepArchitecture metrics={data.metrics} timeseries={data.timeseries} />

                 {/* <AnomalyLog anomalies={data.anomalies} /> */}
               </div>
            </div>

            {/* Recommendations disabled until backend implements LLM anomalies */}
            {/* <div className="w-full mt-6">
                <Recommendations summary={data.summary} anomalies={data.anomalies} />
            </div> */}
            
            <div className="flex items-center justify-between pt-4 mt-8 border-t text-xs text-slate-400 border-slate-200">
              <p>Analysis powered by TensorFlow Keras</p>
              <p>Practitioner: <span className="font-bold text-blue-600">{practitioner?.email}</span></p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function KpiCard({ title, value, subtext, icon }: any) {
  return (
    <div className="flex items-center justify-between p-5 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md">
      <div>
        <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">{title}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-2xl font-black text-slate-900">{value}</h4>
          {subtext && <span className="text-xs font-bold text-slate-400">{subtext}</span>}
        </div>
      </div>
      <div className="p-3 rounded-full bg-slate-50">{icon}</div>
    </div>
  );
}

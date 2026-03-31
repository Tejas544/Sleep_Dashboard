'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, ShieldCheck, Lock, Mail, Loader2, User, Building } from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  // UI State
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  
  const router = useRouter();
  const { login, token } = useAuthStore();

  // Guard: Redirect if already authenticated
  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login');
    setError(''); // Wipe residual errors when switching modes
    // Reset fields
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Dynamically route the request based on the current view
    const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
    const payload = view === 'login' 
      ? { email, password }
      : { email, password, fullName, hospitalName: hospitalName || undefined };

    try {
      const { data } = await api.post(endpoint, payload);

      // Save the JWT and Practitioner data to Zustand
      login(data.token, data.practitioner);
      router.push('/');
      
    } catch (err: any) {
      // Safely extract the error message or Zod validation details from our Node.js controller
      let errorMessage = 'Authentication failed. Please try again.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // If it's a Zod validation error, extract the first specific field error for better UX
        if (err.response.data.details) {
          const firstErrorKey = Object.keys(err.response.data.details)[0];
          errorMessage = err.response.data.details[firstErrorKey][0];
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">InfoSys PRO AI</h1>
          <p className="text-slate-500 text-sm font-medium">
            {view === 'login' ? 'Secure Practitioner Portal' : 'Create Practitioner Account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Conditional Registration Fields */}
          {view === 'register' && (
            <>
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    required 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                    placeholder="Dr. John Doe"
                  />
                </div>
              </div>

              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hospital / Clinic (Optional)</label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={hospitalName} 
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                    placeholder="General Hospital"
                  />
                </div>
              </div>
            </>
          )}

          {/* Standard Fields */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                placeholder="doctor@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            {view === 'register' && <p className="text-[10px] text-slate-500 mt-1 ml-1">Must be at least 8 characters.</p>}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in">
              <p className="text-red-400 text-xs font-bold text-center">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* View Toggle */}
        <div className="mt-6 text-center text-sm text-slate-400">
          {view === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={toggleView} 
            className="font-bold text-blue-500 hover:text-blue-400 hover:underline transition-all"
          >
            {view === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-500">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-medium">HIPAA Compliant Encryption</span>
        </div>
      </div>
    </div>
  );
}
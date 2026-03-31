'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/axios';
import { Check, Zap, Crown, Shield, Loader2 } from 'lucide-react';

// Utility to load Razorpay script
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PricingPage() {
  const router = useRouter();
  const { token, practitioner, updatePlan } = useAuthStore();
  
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Fallback to FREE if state is hydrating
  const currentPlan = practitioner?.planType || 'FREE';

  const handleUpgrade = async (planType: 'INTERMEDIATE' | 'ADVANCE') => {
    if (!token) {
      router.push('/login');
      return;
    }

    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Payment gateway is currently unavailable.");
      return;
    }

    setLoadingPlan(planType);

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) throw new Error('Razorpay SDK failed to load.');

      // 1. Create Order
      const { data: orderData } = await api.post('/payments/create-order', { planType });

      // 2. Configure Razorpay
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "InfoSys PRO AI",
        description: `Upgrade to ${planType} Plan`,
        order_id: orderData.orderId,
        prefill: {
          name: practitioner?.fullName || "",
          email: practitioner?.email || "",
        },
        theme: { color: "#2563eb" }, // Blue-600
        handler: async function (response: any) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // 4. CRITICAL FIX: Synchronize Global State
            // Update Zustand with the new plan returned from the backend
            updatePlan(planType);
            
            alert("Upgrade Successful! Welcome to your new plan.");
            router.push('/');
          } catch (error) {
            console.error("Verification Failed:", error);
            alert("Payment processed, but verification failed. Contact support.");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.error || "Failed to initiate payment.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6 font-sans">
      <div className="max-w-7xl mx-auto text-center mb-16 animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
          Elevate Your Diagnostics
        </h1>
        <p className="text-slate-500 font-medium">
          Select a plan to unlock advanced AI staging and unlimited reporting.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BASIC PLAN */}
        <PricingCard 
          title="Basic"
          price="Free"
          icon={<Shield className="w-6 h-6 text-slate-500" />}
          features={['1 Patient Report / Day', 'Standard Export', 'Community Support']}
          isActive={currentPlan === 'FREE'}
          buttonText={currentPlan === 'FREE' ? 'Current Plan' : 'Downgrade via Support'}
          buttonAction={() => {}}
          disabled={true}
        />

        {/* INTERMEDIATE PLAN */}
        <PricingCard 
          title="Intermediate"
          price="₹499"
          icon={<Zap className="w-6 h-6 text-blue-500" />}
          features={['10 Patient Reports / Day', 'Advanced Hypnogram Export', 'Email Support']}
          isActive={currentPlan === 'INTERMEDIATE'}
          buttonText={currentPlan === 'INTERMEDIATE' ? 'Current Plan' : (currentPlan === 'ADVANCE' ? 'Included in Advance' : 'Upgrade Now')}
          buttonAction={() => handleUpgrade('INTERMEDIATE')}
          disabled={currentPlan === 'INTERMEDIATE' || currentPlan === 'ADVANCE'}
          loading={loadingPlan === 'INTERMEDIATE'}
        />

        {/* ADVANCE PLAN */}
        <PricingCard 
          title="Advance"
          price="₹999"
          icon={<Crown className="w-6 h-6 text-amber-500" />}
          features={['Unlimited Diagnostics', 'Priority AI Processing', '24/7 Clinical Support', 'Patient History Logs']}
          isActive={currentPlan === 'ADVANCE'}
          buttonText={currentPlan === 'ADVANCE' ? 'Current Plan' : 'Upgrade Now'}
          buttonAction={() => handleUpgrade('ADVANCE')}
          disabled={currentPlan === 'ADVANCE'}
          loading={loadingPlan === 'ADVANCE'}
          highlight={true}
        />

      </div>
    </div>
  );
}

// Reusable UI Component for Cards
function PricingCard({ 
  title, price, icon, features, isActive, buttonText, buttonAction, disabled, loading, highlight = false 
}: any) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
      highlight ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/10 scale-105 z-10' : 'border border-slate-200 shadow-md hover:shadow-lg'
    }`}>
      {isActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
          Active Plan
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className={`p-3 rounded-xl mb-4 ${highlight ? 'bg-blue-50' : 'bg-slate-50'}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <div className="mt-4 flex items-baseline text-slate-900">
          <span className="text-4xl font-black tracking-tight">{price}</span>
          {price !== 'Free' && <span className="text-slate-500 ml-1 font-medium">/month</span>}
        </div>
      </div>

      <ul className="flex-1 space-y-4 mb-8">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start">
            <Check className="w-5 h-5 text-emerald-500 shrink-0 mr-3" />
            <span className="text-slate-600 text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={buttonAction}
        disabled={disabled || loading}
        className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex justify-center items-center ${
          isActive 
            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
            : disabled 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : highlight
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
      </button>
    </div>
  );
}
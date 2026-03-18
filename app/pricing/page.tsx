'use client';

import React from 'react';
import { Check, Zap, Crown } from 'lucide-react';

export default function PricingPage() {
  const handlePayment = (planName: string, price: number) => {
    const options = {
      key: "rzp_test_SSdojFAOvhKLub", // Replace with your Razorpay Test Key
      amount: price * 100, 
      currency: "INR",
      name: "InfoSys PRO AI",
      description: `Upgrade to ${planName} Plan`,
      handler: function (response: any) {
        alert(`Upgrade Successful! Payment ID: ${response.razorpay_payment_id}`);
        window.location.href = "/";
      },
      theme: { color: "#2563eb" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Elevate Your Diagnostics</h2>
        <p className="text-slate-500 mb-12">Select a plan to unlock advanced AI staging and unlimited reporting.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Intermediate Plan */}
          <PricingCard 
            title="Intermediate" 
            price={499} 
            icon={<Zap className="w-6 h-6 text-blue-500" />}
            features={["10 Patient Reports / Day", "Advanced Hypnogram Export", "Email Support"]}
            onSelect={() => handlePayment('Intermediate', 499)}
          />

          {/* Advance Plan */}
          <PricingCard 
            title="Advance" 
            price={999} 
            featured
            icon={<Crown className="w-6 h-6 text-amber-500" />}
            features={["Unlimited Diagnostics", "Priority AI Processing", "24/7 Clinical Support", "Patient History Logs"]}
            onSelect={() => handlePayment('Advance', 999)}
          />
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, features, onSelect, icon, featured = false }: any) {
  return (
    <div className={`p-8 rounded-2xl bg-white border ${featured ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200 shadow-sm'} transition-all`}>
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <div className="my-6">
        <span className="text-4xl font-black">₹{price}</span>
        <span className="text-slate-400">/month</span>
      </div>
      <ul className="space-y-4 mb-8 text-left">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
            <Check className="w-4 h-4 text-emerald-500" /> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect}
        className={`w-full py-3 rounded-xl font-bold transition-all ${featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
      >
        Upgrade Now
      </button>
    </div>
  );
}
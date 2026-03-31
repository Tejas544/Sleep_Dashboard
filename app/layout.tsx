import './globals.css';
import Script from 'next/script';
//import { Providers } from './providers'; // We will create this next

export const metadata = {
  title: 'InfoSys PRO AI | Clinical Sleep Staging',
  description: 'Advanced Sleep Architecture and Signal Analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load Razorpay globally for the pricing page */}
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased">
          {children}
      </body>
    </html>
  );
}
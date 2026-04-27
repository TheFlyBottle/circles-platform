import { Lora, Vazirmatn } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const lora = Lora({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap',
});

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'], 
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'The Fly Bottle Circles',
  description: 'Premium Registration Platform for The Fly Bottle',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${vazirmatn.variable} ${lora.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="container min-h-screen">
          <header className="main-header" style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img 
                src="/circles-bg.png" 
                alt="The Fly Bottle Circles Logo" 
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  objectFit: 'cover', 
                  borderRadius: '50%', 
                  boxShadow: '0 8px 24px rgba(74, 93, 78, 0.15)',
                  border: '4px solid var(--background)'
                }} 
              />
            </div>
            <h1 className="font-serif" style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>
              The Fly Bottle Circles
            </h1>
          </header>
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

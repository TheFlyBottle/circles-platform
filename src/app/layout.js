import { Lora, Vazirmatn } from 'next/font/google';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import HeaderNavLinks from './HeaderNavLinks';
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
  description: 'Circle Coordination and Seminar Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${vazirmatn.variable} ${lora.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <main className="container min-h-screen">
          <header className="main-header" style={{ marginBottom: '3rem', paddingTop: '1rem' }}>
            <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'inherit' }}>
                <img
                  src="/circles-bg.png"
                  alt="Logo"
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-sm)',
                    border: '2px solid var(--border-color)'
                  }}
                />
                <span className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--accent-primary)', letterSpacing: '0.02em' }}>
                  The Fly Bottle
                </span>
              </Link>
              <HeaderNavLinks />
            </nav>
          </header>
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

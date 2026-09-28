import type { Metadata } from 'next';
import { Caveat, Hanken_Grotesk, Young_Serif } from 'next/font/google';
import './globals.css';

const youngSerif = Young_Serif({ subsets: ['latin'], weight: '400', variable: '--font-young-serif', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-hanken', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-caveat', display: 'swap' });

export const metadata: Metadata = {
  title: {
    default: 'Keystone Craft Studio — Handmade goods + creative workshops · Harrisburg, PA',
    template: '%s — Keystone Craft Studio',
  },
  description: 'Keystone Craft Studio is a home for handmade goods and hands-on workshops in Harrisburg, Pennsylvania.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${hanken.variable} ${caveat.variable}`}>
      <body className="font-sans min-h-screen">{children}</body>
    </html>
  );
}

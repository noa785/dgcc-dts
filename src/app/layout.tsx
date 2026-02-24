// src/app/layout.tsx
import type { Metadata } from 'next';
import { Syne, Instrument_Sans } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DGCC Enterprise System',
  description: 'Institutional project and governance management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${instrumentSans.variable} font-sans bg-[#080b10] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}

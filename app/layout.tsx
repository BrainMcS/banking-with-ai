export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif'
})

export const metadata: Metadata = {
  title: "Horizon",
  description: "Horizon is a modern banking platform for everyone.",
  icons: {
    icon: '/icons/logo.svg'
  }
};

import { ThemeProvider } from '@/lib/context/ThemeContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexSerif.variable} font-inter bg-white dark:bg-dark-background text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <div className="min-h-screen transition-colors">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * Root Layout Component
 *
 * PURPOSE: Wraps entire application with global providers and configuration
 *
 * This layout applies to ALL pages and routes in the app.
 * It's where we configure app-wide settings like:
 * - Theme system (dark/light mode)
 * - Font loading and CSS variables
 * - Global metadata (SEO)
 * - HTML structure (lang, suppressHydrationWarning)
 *
 * DESIGN DECISIONS:
 *
 * 1. suppressHydrationWarning on <html>:
 *    WHY: next-themes modifies the <html> element's class on mount to set theme.
 *    This happens client-side after server render, causing hydration mismatch.
 *    suppressHydrationWarning prevents React warning about this expected behavior.
 *
 * 2. ThemeProvider configuration:
 *    - attribute="class" → Themes applied via class="dark" on <html>
 *    - defaultTheme="system" → Respects user's OS dark mode preference
 *    - enableSystem → Listens to OS theme changes
 *    - disableTransitionOnChange → Prevents flash during theme switch
 *
 * 3. Font loading (Geist):
 *    - Loaded as CSS variable (--font-geist-sans) for Tailwind
 *    - display="swap" → Show fallback font until Geist loads (performance)
 *    - subsets=["latin"] → Only load Latin characters (smaller bundle)
 *
 * 4. Metadata:
 *    - metadataBase required for Next.js App Router
 *    - Used by nested pages for SEO (og:image, canonical URLs)
 *
 * @see /app/globals.css - Tailwind config and font CSS variables
 * @see /components/theme-switcher.tsx - UI component to toggle theme
 */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

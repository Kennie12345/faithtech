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
 * 3. Font loading (FaithTech Design System):
 *    Per docs/style_guide.md, the design system uses:
 *    - Inter: Primary body font (--_typography---body-font--paragraph-family)
 *    - Inter: Also used for headings (--_typography---heading-font--heading-family)
 *      Note: Noigrotesk is specified in style guide but requires licensing. Inter is the fallback.
 *    - Playfair Display: Accent/decorative font (--_typography---accent-font--accent-family)
 *      Note: Avril is specified in style guide but requires licensing. Playfair Display is similar serif.
 *    - display="swap" → Show fallback font until custom fonts load (performance)
 *    - subsets=["latin"] → Only load Latin characters (smaller bundle)
 *    - Font variables mapped to design system CSS variables in Tailwind config
 *
 * 4. Metadata:
 *    - metadataBase required for Next.js App Router
 *    - Used by nested pages for SEO (og:image, canonical URLs)
 *
 * @see /app/globals.css - Design system CSS variables
 * @see /docs/style_guide.md - Complete design system documentation
 * @see /tailwind.config.ts - Design token mappings
 */

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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

// Primary font: Inter for both body and headings (Noigrotesk alternative)
const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heading", // Maps to font-heading in Tailwind
  display: "swap",
  subsets: ["latin"],
});

// Body font: Inter (same as heading for now, can differentiate later)
const interBody = Inter({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body", // Maps to font-body in Tailwind
  display: "swap",
  subsets: ["latin"],
});

// Accent font: Playfair Display (Avril/Palatino alternative)
const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  variable: "--font-accent", // Maps to font-accent in Tailwind
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interBody.variable} ${playfair.variable}`}>
      <body className={`${interBody.className} antialiased`}>
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

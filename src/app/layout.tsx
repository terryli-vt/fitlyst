import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata Configuration (define SEO-related information)
 * 
 * This metadata object defines the page title and description that appear in:
 * - Browser tab title
 * - Search engine results (SEO)
 * - Social media previews (when shared on platforms like Twitter, Facebook, etc.)
 * - Browser bookmarks
 * 
 * The title should be concise and include your brand name.
 * The description should be compelling and include relevant keywords for SEO.
 */
export const metadata: Metadata = {
  title: "Fitlyst - AI-Powered Nutrition and Fitness Companion",
  description: "Your personalized AI-powered nutrition and fitness companion. Get custom calorie plans, meal suggestions, and beginner-friendly guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

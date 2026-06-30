import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Outfit, Press_Start_2P } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import React from "react";
import QueryProvider from "@/components/query-provider";
import { Toaster } from "@/components/ui/8bitcn/sonner";
import { TooltipProvider } from "@/components/ui/8bit/tooltip";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const pressStart2P = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "AI-GO-GO | Social Media Scheduling",
  description:
    "Create AI-powered social media scheduling for every platform in seconds. AI-GO-GO is a platform that allows you to create social media scheduling for every platform in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${pressStart2P.variable} h-full antialiased`}
      // suppressHydrationWarning: needed for next-themes class injection on <html>
      suppressHydrationWarning
      style={
        {
          "--font-outfit": outfit.style.fontFamily,
          "--font-press-start": pressStart2P.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

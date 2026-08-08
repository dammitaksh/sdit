import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { DashboardStateProvider } from "@/components/dashboard-state-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SRE Agent Dashboard",
  description:
    "A dark-mode-first control surface for AI-assisted DevOps operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetBrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <DashboardStateProvider>{children}</DashboardStateProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Georama, Geist_Mono } from "next/font/google";
import "./globals.css";

const georama = Georama({
  variable: "--font-georama",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentGuard — Risk Firewall for Autonomous Trading Agents",
  description:
    "AgentGuard sits between autonomous agents and Bitget execution APIs, enforcing deterministic risk policies before trades reach the exchange.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${georama.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Substrate — The memory layer for AI agents",
  description: "Shared context and memory bus for multi-agent AI systems",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

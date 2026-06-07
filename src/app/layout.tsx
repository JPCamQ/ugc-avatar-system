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

export const metadata: Metadata = {
  title: "UGC Avatar Studio v2.0 — Ecosistema de Influencers de IA & Embudos Virales",
  description: "Dashboard premium para gestionar avatares UGC de Inteligencia Artificial, planificar contenido editorial de lifestyle, simular DMs bilingües y automatizar el setup viral en redes sociales.",
  authors: [{ name: "JPQ Digital" }],
  keywords: ["UGC", "AI Influencer", "Avatar", "Instagram API", "TikTok API", "Next.js", "DeepSeek"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

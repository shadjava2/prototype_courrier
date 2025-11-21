import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import AnimatedEnvelopeBackground from "@/components/AnimatedEnvelopeBackground";

export const metadata: Metadata = {
  title: "Gestion de Courrier - Ministère du Transport",
  description: "Prototype de gestion de courrier pour le Ministère du Transport (RDC)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0033A0" />
      </head>
      <body className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 relative">
        <AnimatedEnvelopeBackground />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

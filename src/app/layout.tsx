import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FitmaxProvider } from "@/context/FitmaxContext";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fitmax - Entrenador IA",
  description: "Tu entrenador personal y nutricionista impulsado por Inteligencia Artificial.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <FitmaxProvider>
          {children}
          <BottomNav />
        </FitmaxProvider>
      </body>
    </html>
  );
}

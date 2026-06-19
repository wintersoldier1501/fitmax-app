import type { Metadata } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { FitmaxProvider } from "@/context/FitmaxContext";
import { BottomNav } from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

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
      <body className={`${inter.variable} ${outfit.variable} ${jakarta.variable} font-sans`}>
        <FitmaxProvider>
          {children}
          <BottomNav />
        </FitmaxProvider>
      </body>
    </html>
  );
}

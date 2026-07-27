import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { AmbientBackground } from "@/components/AmbientBackground";
import { RouteTransition } from "@/components/RouteTransition";
import { BadgeUnlockedToast } from "@/components/BadgeUnlockedToast";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ranked Quiz — Live & Competitive",
  description:
    "Affronte le monde en direct : Time Attack, Jetpunk, Ranked ELO, Thématique et Duel 1v1.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F4F5FA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="app-bg relative min-h-full flex flex-col overflow-x-hidden font-sans text-foreground">
        <AmbientBackground />
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col sm:border-x sm:border-black/[0.04]">
          <RouteTransition>{children}</RouteTransition>
        </div>
        <BadgeUnlockedToast />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PWARegister } from "@/components/pwa/register";
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
  title: "App Catequistas",
  description: "Sistema de cadastro e controle de presença de catequistas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Catequistas",
    statusBarStyle: "black-translucent",
  },
  icons: [
    { rel: "icon", url: "/icons/icon-192.svg" },
    { rel: "apple-touch-icon", url: "/icons/icon-192.svg" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#22c55e" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <PWARegister />
      </body>
    </html>
  );
}

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
  metadataBase: new URL("https://catequistas.housecloud.tec.br"),
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
  openGraph: {
    title: "App Catequistas",
    description: "Sistema de cadastro e controle de presença de catequistas",
    url: "https://catequistas.housecloud.tec.br",
    siteName: "App Catequistas",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "App Catequistas",
    description: "Sistema de cadastro e controle de presença de catequistas",
    images: ["/opengraph-image"],
  },
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
      <body className="min-h-full flex flex-col bg-background text-foreground" style={{ backgroundColor: "#0a0a0f", colorScheme: "dark" }}>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import PWAInstaller from "@/components/PWAInstaller";

export const metadata: Metadata = {
  title: "Prospecta - Real Estate Lead App",
  description: "Facebook-first PWA for real estate agents to manage properties and leads.",
  manifest: "/manifest.json",
  themeColor: "#1877F2",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prospecta",
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1877F2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}

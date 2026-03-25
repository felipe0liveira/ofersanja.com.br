import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Ofersanja — As melhores ofertas no seu WhatsApp",
  description: "Receba as melhores ofertas da internet direto no seu WhatsApp. Entre no grupo VIP de ofertas do Ofersanja!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} antialiased`}>
      <body>{children}</body>
      <GoogleAnalytics gaId="G-K5KZDXVNJN" />
    </html>
  );
}

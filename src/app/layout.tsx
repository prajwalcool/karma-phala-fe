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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://karma-phala.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Schulte Table — Speed & Focus Training",
    template: "%s | Schulte Table",
  },
  description:
    "Train your peripheral vision and concentration with the Schulte table. Click numbers 1–25 in order as fast as you can. Track your best time and improve focus.",
  keywords: [
    "Schulte table",
    "brain training",
    "focus game",
    "peripheral vision",
    "concentration",
    "speed reading",
    "cognitive training",
  ],
  authors: [{ name: "Karma Phala" }],
  creator: "Karma Phala",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Schulte Table",
    title: "Schulte Table — Speed & Focus Training",
    description:
      "Train your peripheral vision and concentration. Click numbers 1–25 in order. Track your best time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schulte Table — Speed & Focus Training",
    description:
      "Train your peripheral vision and concentration. Click numbers 1–25 in order. Track your best time.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

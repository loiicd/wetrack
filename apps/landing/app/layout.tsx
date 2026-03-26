import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ReactNode } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WeTrack – Dashboard-as-Code",
  description:
    "Define dashboards, data sources, queries and charts as TypeScript code. Deploy instantly. No low-code builder, no manual configuration.",
  openGraph: {
    title: "WeTrack – Dashboard-as-Code",
    description:
      "Define dashboards, data sources, queries and charts as TypeScript code. Deploy instantly.",
    type: "website",
    url: "https://wetrack.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "WeTrack – Dashboard-as-Code",
    description: "Dashboards as TypeScript. Deploy with one command.",
  },
  robots: { index: true, follow: true },
};

type Props = { children: ReactNode };

const Layout = ({ children }: Props) => (
  <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Navbar />
      {children}
    </body>
  </html>
);

export default Layout;

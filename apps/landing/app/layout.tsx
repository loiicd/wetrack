import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

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
  <html
    lang="en"
    suppressHydrationWarning
    className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}
  >
    <body className="antialiased">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default Layout;

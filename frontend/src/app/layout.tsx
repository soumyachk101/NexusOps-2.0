import type { Metadata } from "next";
import { Inter, Space_Grotesk, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexusOps — AI Command Center",
  description:
    "Dual-module AI platform: Memory Engine for team knowledge + AutoFix Engine for production incident resolution. One unified cockpit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
      <body
        className="font-sans antialiased bg-bg-base text-text-primary selection:bg-nexus-primary/30 selection:text-white"
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

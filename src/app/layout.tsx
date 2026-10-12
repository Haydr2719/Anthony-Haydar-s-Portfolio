import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SITE_URL } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Anthony Haydar | Beverage & Operations Consultant", template: "%s | Anthony Haydar" },
  description: "Beverage & Operations Consultant for hospitality businesses and beverage brands.",
};

export const viewport: Viewport = {
  themeColor: "#1f1f1d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable}`}
      // Tells Next.js to disable smooth scrolling during route changes (page jumps stay instant)
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available so scroll-reveal styles only apply when they can be undone */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

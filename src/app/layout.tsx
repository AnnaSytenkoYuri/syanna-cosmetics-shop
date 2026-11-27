import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import "./globals.css";
import { HeaderFallback, SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShopProvider } from "@/components/shop-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: {
    default: "Syanna Cosmetics",
    template: "%s · Syanna Cosmetics",
  },
  description:
    "Syanna Cosmetics is an international skincare brand. Climate Care is a preview collection for hot humid air and dry indoor air. Nothing is for sale yet.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ShopProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-background focus:px-3 focus:py-2"
          >
            Skip to content
          </a>
          <Suspense fallback={<HeaderFallback />}>
            <SiteHeader />
          </Suspense>
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </ShopProvider>
      </body>
    </html>
  );
}

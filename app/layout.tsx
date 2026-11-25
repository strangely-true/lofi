import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const objectSansFallback = Plus_Jakarta_Sans({
  variable: "--font-object-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://still-lofi.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1d",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Still — Lofi Focus, Pomodoro & Ambient Sky",
    template: "%s — Still",
  },
  description:
    "A calm, distraction-free lofi radio, live astronomical sky, weather atmosphere, and minimalist Pomodoro focus timer.",
  applicationName: "Still",
  keywords: [
    "lofi radio",
    "pomodoro timer",
    "focus timer",
    "ambient music",
    "study clock",
    "minimalist clock",
    "lofi focus",
    "zen focus app",
  ],
  authors: [{ name: "Sabittwa", url: "https://strangelytrue.vercel.app" }],
  creator: "Sabittwa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Still",
    title: "Still — Lofi Focus, Pomodoro & Ambient Sky",
    description:
      "A calm, distraction-free lofi radio, live astronomical sky, weather atmosphere, and minimalist Pomodoro focus timer.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Still — Lofi Focus, Pomodoro & Ambient Sky",
    description:
      "A calm, distraction-free lofi radio, live astronomical sky, weather atmosphere, and minimalist Pomodoro focus timer.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Still — Lofi Focus",
  url: siteUrl,
  description:
    "A calm, distraction-free lofi radio, live astronomical sky, weather atmosphere, and minimalist Pomodoro focus timer.",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Sabittwa",
    url: "https://strangelytrue.vercel.app",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={cn("h-full antialiased", objectSansFallback.variable)}>
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

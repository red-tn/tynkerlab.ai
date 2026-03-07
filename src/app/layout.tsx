import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { AmbientBackground } from "@/components/ambient-background";
import { BrandProvider } from "@/components/brand/brand-provider";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tynkerlab.ai",
  url: "https://tynkerlab.ai",
  logo: "https://tynkerlab.ai/icon.png",
  description: "AI-powered platform for image, video, and speech generation with 56+ state-of-the-art models.",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: "https://tynkerlab.ai/contact",
  },
};

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tynkerlab.ai",
  url: "https://tynkerlab.ai",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  description: "Generate stunning AI images, videos, and lifelike speech with 56+ models including FLUX, Imagen 4, Veo 2, and Sora.",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "USD",
    lowPrice: "0",
    highPrice: "99",
    offerCount: "3",
  },
  featureList: [
    "AI Image Generation",
    "AI Video Generation",
    "Text to Speech",
    "Image to Image",
    "Image to Video",
    "UGC Avatar Creation",
    "AI Prompt Maker",
    "Studio Templates",
  ],
};

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://tynkerlab.ai"),
  title: {
    default: "Tynkerlab.ai — AI Image, Video & Speech Generator",
    template: "%s | Tynkerlab.ai",
  },
  description: "Generate stunning AI images, videos, and lifelike speech with 56+ models including FLUX, Imagen 4, Veo 2, Sora, and Kling. Start free — no credit card required.",
  keywords: [
    "AI image generator",
    "AI video generator",
    "text to image AI",
    "text to video AI",
    "AI art generator",
    "AI speech generator",
    "AI creative tools",
    "FLUX image model",
    "Imagen 4",
    "Veo 2",
    "Sora video",
    "free AI image generator",
    "AI design platform",
    "Tynkerlab",
    "Tynkerlab AI",
  ],
  authors: [{ name: "Tynkerlab.ai", url: "https://tynkerlab.ai" }],
  creator: "Tynkerlab.ai",
  publisher: "Tynkerlab.ai",
  applicationName: "Tynkerlab.ai",
  alternates: {
    canonical: "https://tynkerlab.ai",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tynkerlab.ai",
    siteName: "Tynkerlab.ai",
    title: "Tynkerlab.ai — AI Image, Video & Speech Generator",
    description: "Generate stunning AI images, videos, and lifelike speech with 56+ models. Start free — no credit card required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tynkerlab.ai — AI Image, Video & Speech Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@edwarzio",
    creator: "@edwarzio",
    title: "Tynkerlab.ai — AI Image, Video & Speech Generator",
    description: "Generate stunning AI images, videos, and lifelike speech with 56+ models. Start free — no credit card required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={webApplicationSchema} />
        <AmbientBackground />
        <BrandProvider />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

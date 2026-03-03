import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { AmbientBackground } from "@/components/ambient-background";
import { BrandProvider } from "@/components/brand/brand-provider";
import "./globals.css";

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "Tynkerlab.ai — AI-Powered Image & Video Generation",
    template: "%s | Tynkerlab.ai",
  },
  description: "Create Beyond Imagination — Generate stunning images and videos with the latest AI models. FLUX, Imagen, Veo, Sora, and more.",
  keywords: ["AI image generation", "AI video generation", "text to image", "text to video", "FLUX", "Imagen", "Veo", "Sora"],
  authors: [{ name: "Tynkerlab.ai" }],
  creator: "Tynkerlab.ai",
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
    title: "Tynkerlab.ai — AI-Powered Image & Video Generation",
    description: "Create Beyond Imagination — Generate stunning images and videos with the latest AI models.",
    images: [{ url: "/og-image.png", width: 1024, height: 1024, alt: "Tynkerlab.ai" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tynkerlab.ai — AI-Powered Image & Video Generation",
    description: "Create Beyond Imagination — Generate stunning images and videos with the latest AI models.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
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
        <AmbientBackground />
        <BrandProvider />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

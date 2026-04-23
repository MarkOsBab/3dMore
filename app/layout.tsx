import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import CartModal from "../components/CartModal";
import CartToast from "../components/CartToast";
import { CartProvider } from "../lib/CartContext";
import { AuthProvider } from "../lib/AuthContext";
import PublicShell from "@/components/PublicShell";
import Footer from "@/components/Footer";
import HashScroller from "@/components/HashScroller";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://3d-more.vercel.app";
const SITE_NAME = "3DMORE";
const SITE_DESCRIPTION =
  "Accesorios para casco impresos en 3D en Uruguay. Orejitas, cuernos, alas y más diseños únicos para motociclistas. Envíos a todo Uruguay.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "3DMORE | Accesorios para casco de moto impresos en 3D — Uruguay",
    template: "%s | 3DMORE",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "accesorios para casco",
    "accesorios casco moto",
    "accesorios para casco de moto",
    "orejitas para casco",
    "cuernos para casco",
    "alas para casco",
    "accesorios impresos en 3D",
    "impresión 3D Uruguay",
    "personalizar casco",
    "accesorios motociclistas Uruguay",
    "casco moto Uruguay",
    "3DMORE",
  ],
  authors: [{ name: "3DMORE" }],
  creator: "3DMORE",
  publisher: "3DMORE",
  applicationName: SITE_NAME,
  category: "shopping",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_UY",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "3DMORE | Accesorios para casco de moto impresos en 3D",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "3DMORE — Accesorios para casco impresos en 3D",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "3DMORE | Accesorios para casco de moto impresos en 3D",
    description: SITE_DESCRIPTION,
    images: ["/images/og-cover.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/icon.jpg", type: "image/jpeg" },
    ],
    apple: "/images/icon.jpg",
    shortcut: "/images/icon.jpg",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "3D More",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description: SITE_DESCRIPTION,
  areaServed: {
    "@type": "Country",
    name: "Uruguay",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Spanish"],
    areaServed: "UY",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "es-UY",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-UY" className={`${outfit.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <HashScroller />
        <AuthProvider>
          <CartProvider>
            <PublicShell>
              <Navbar />
              <CartModal />
              <CartToast />
            </PublicShell>
            {children}
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

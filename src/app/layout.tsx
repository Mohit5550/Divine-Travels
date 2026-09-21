import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { CookieConsent } from "@/components/ui/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Base Open Graph and Twitter Card defaults
const defaultOgImage = "/og-image.jpg";
const defaultTitle = "Divine Travels - India's Premium Travel & Adventure Booking";
const defaultDescription = "Discover sacred destinations, adventure tours, and pilgrimage packages across India. Book taxis, tours, and holidays with verified drivers and transparent pricing.";

export const metadata: Metadata = {
  title: {
    default: defaultTitle,
    template: "%s | Divine Travels",
  },
  description: defaultDescription,
  keywords: [
    "Divine Travel",
    "Uttarakhand",
    "Travel",
    "Pilgrimage",
    "Adventure",
    "Rishikesh",
    "Haridwar",
    "Char Dham",
    "Tour Packages",
    "Taxi Booking",
  ],
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://divinetravels.in"),

  // Open Graph / Facebook
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "Divine Travels - Premium Travel & Adventures",
      },
    ],
    type: "website",
    locale: "en_IN",
    url: "https://divinetravels.in",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [defaultOgImage],
    site: "@divinetravels",
  },
};

// Default React component for the layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="bottom-right" />
        <CookieConsent />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
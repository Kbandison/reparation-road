import type { Metadata } from "next";
import "./globals.css";
import { EB_Garamond, Inter } from "next/font/google";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import { StructuredData } from "@/components/StructuredData";
import { generateStructuredData } from "@/lib/metadata";

const garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-garamond",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Reparation Road",
    template: "%s | Reparation Road",
  },
  description:
    "Reparation Road is a cultural and historical resource dedicated to uncovering Black history and empowering communities through research, genealogy, and education.",
  keywords: [
    "Black history",
    "genealogy",
    "cultural preservation",
    "historical research",
    "community empowerment",
    "education",
    "reparation road",
  ],
  openGraph: {
    title: "Reparation Road",
    description:
      "Uncover your family history and explore Black heritage with Reparation Road’s research, genealogy, and cultural resources.",
    url: "https://reparationroad.org",
    siteName: "Reparation Road",
    images: [
      {
        url: "/Reparation Road-01.png", // Place your OG/social image in /public
        width: 1200,
        height: 630,
        alt: "Reparation Road",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@reparationroad", // update with the org’s Twitter if available
    title: "Reparation Road",
    description:
      "Uncover your family history and explore Black heritage with Reparation Road’s research, genealogy, and cultural resources.",
    images: ["/Reparation Road-01.png"],
  },
  icons: {
    icon: "/Reparation Road-01.png",
    shortcut: "/Reparation Road-01.png",
    apple: "/Reparation Road-01.png", // Place this in /public if you have it
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" }, // tan
    { media: "(prefers-color-scheme: dark)", color: "#183826" }, // dark green
  ],
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://reparationroad.org"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = generateStructuredData('organization', {});

  return (
    <html lang="en">
      <head>
        {organizationData && <StructuredData data={organizationData} />}
      </head>
      <body className={`${garamond.variable} ${inter.variable}`}>
        <Analytics />
        <AuthProvider>
          <BookmarkProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </BookmarkProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

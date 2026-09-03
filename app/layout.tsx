import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { SITE, websiteLd } from "@/lib/seo";

const display = Newsreader({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});
const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  // metadataBase is what turns every relative image and canonical below into an
  // absolute URL. Without it a crawler and a link preview both see nothing.
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    // So a subpage reads "Pillars, Built, Installed, Sold" rather than a bare
    // "Pillars", which says nothing in a search result or a browser tab.
    template: `%s, ${SITE.name}`,
  },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
      // The theme script sets data-theme on this element before hydration, so
      // the server markup and the client tree differ by exactly that attribute
      // and by nothing else. Suppressing here covers this element only.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* Applies a stored theme choice before hydration, so a reader who has
            pinned the theme their system does not choose never sees the other
            one flash first. beforeInteractive is injected into the initial HTML
            from the server and runs ahead of any Next module. */}
        <Script id="theme-preference" strategy="beforeInteractive">
          {"try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}"}
        </Script>
        <script
          type="application/ld+json"
          // Structured data is the only part of a page a retrieval model reads
          // as fact rather than as prose it has to interpret.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd()) }}
        />
        <Nav />
        {children}
      </body>
    </html>
  );
}

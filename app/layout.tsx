import type { Metadata } from "next";
import Script from "next/script";
import { Newsreader, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const display = Newsreader({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});
const sans = Geist({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-mono-face", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Built, Installed, Sold",
  description:
    "Sify Infinit Spaces reports 188 MW of built capacity and earns revenue on 114. This reads the filed prospectus to work out what that costs.",
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
        <Nav />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
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
    >
      <body className="flex min-h-full flex-col font-sans">
        <Nav />
        {children}
      </body>
    </html>
  );
}

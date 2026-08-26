import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const serif = Source_Serif_4({
  variable: "--font-serif-face",
  subsets: ["latin"],
});
const sans = Inter({ variable: "--font-sans-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Gigawatt Gap",
  description:
    "India announced a gigawatt data centre buildout. This measures what the grid, the water table and the tariff will actually carry.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

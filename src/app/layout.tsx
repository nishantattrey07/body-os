import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const teko = Teko({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Body OS",
  description: "Operating System for your Body",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${teko.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}

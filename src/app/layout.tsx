import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import { Toaster } from "sonner";
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
        <Toaster 
          position="top-center" 
          richColors 
          theme="light"
          className="font-body"
          toastOptions={{
            classNames: {
              error: 'bg-red-50 border border-red-200 text-red-800 shadow-xl rounded-2xl p-4',
              success: 'bg-green-50 border border-green-200 text-green-800 shadow-xl rounded-2xl p-4',
              title: 'font-heading font-bold text-lg tracking-wide',
              description: 'font-body text-sm opacity-90',
            }
          }}
        />
      </body>
    </html>
  );
}
